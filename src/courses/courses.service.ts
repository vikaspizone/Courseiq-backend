import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../databaseSchema/course.schema';
import { CourseTranslation } from '../databaseSchema/course-translation.schema';
import { CourseCategory } from '../databaseSchema/course-category.schema';
import { Language } from '../databaseSchema/language.schema';
import { CoursePrice } from '../databaseSchema/course-price.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseFilterDto } from './dto/course-filter.dto';
import { CourseRating } from '../databaseSchema/course-rating.schema';
import { trans, localeStorage } from '../utils/trans';
import { CourseType, CourseLevel, CourseStatus } from '../utils/enums';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseTranslation)
    private readonly translationRepository: Repository<CourseTranslation>,
    @InjectRepository(CourseCategory)
    private readonly categoryRepository: Repository<CourseCategory>,
    @InjectRepository(Language)
    private readonly languageRepository: Repository<Language>,
    @InjectRepository(CoursePrice)
    private readonly priceRepository: Repository<CoursePrice>,
  ) {}

  // Create a new course with translations
  async create(createDto: CreateCourseDto, userId: string): Promise<{ message: string; data: Course }> {

    const categoryExists = await this.categoryRepository.findOne({
      where: { id: createDto.category_id },
    });
    if (!categoryExists) {
      throw new NotFoundException(trans('course.category_not_found'));
    }

    const slugExists = await this.courseRepository.findOne({
      where: { slug: createDto.slug },
    });
    if (slugExists) {
      throw new ConflictException(trans('course.slug_exists'));
    }

    const course = this.courseRepository.create({
      category_id: createDto.category_id,
      type: createDto.type,
      level: createDto.level,
      slug: createDto.slug,
      thumbnail: createDto.thumbnail || null,
      image: createDto.image || null,
      language: createDto.language || null,
      topics: createDto.topics || null,
      status: createDto.status || CourseStatus.DRAFT,
      created_by: userId,
    });

    const savedCourse = await this.courseRepository.save(course);

    const translations: CourseTranslation[] = [];
    for (const tDto of createDto.translations) {
      const lang = await this.languageRepository.findOne({
        where: { code: tDto.languageCode },
      });

      if (!lang) {
        throw new NotFoundException(trans('course.lang_not_found', { code: tDto.languageCode }));
      }

      const translation = this.translationRepository.create({
        course_id: savedCourse.id,
        language_id: lang.id,
        title: tDto.title,
        description: tDto.description || null,
        overview: tDto.overview || null,
      });

      translations.push(translation);
    }

    savedCourse.translations = await this.translationRepository.save(translations);

    if (createDto.price) {
      const pDto = createDto.price;
      const priceRecord = this.priceRepository.create({
        course_id: savedCourse.id,
        currency: pDto.currency,
        price: pDto.price,
        discount_price: pDto.discount_price || null,
        discount_type: pDto.discount_type || null,
        discount_value: pDto.discount_value || null,
        discount_start_at: pDto.discount_start_at || null,
        discount_end_at: pDto.discount_end_at || null,
        created_by: userId,
      });
      savedCourse.prices = [await this.priceRepository.save(priceRecord)];
    } else {
      savedCourse.prices = [];
    }

    const reloaded = await this.findOneLocalized(savedCourse.id);

    return {
      message: trans('course.created'),
      data: reloaded,
    };
  }

  async findAll(options: CourseFilterDto): Promise<any> {
    const page = Math.max(1, Number(options.page || 1));
    const limit = Math.max(1, Number(options.limit || 10));
    const skip = (page - 1) * limit;

    const queryBuilder = this.courseRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .leftJoinAndSelect('course.category', 'category')
      .leftJoinAndSelect('category.translations', 'categoryTranslation')
      .leftJoinAndSelect('categoryTranslation.language', 'categoryLanguage')
      .leftJoinAndSelect('course.prices', 'prices');

    if (options.search) {
      queryBuilder.andWhere(
        '(LOWER(translation.title) LIKE LOWER(:search) OR LOWER(translation.description) LIKE LOWER(:search))',
        { search: `%${options.search}%` },
      );
    }

    if (options.category_id) {
      queryBuilder.andWhere('course.category_id = :category_id', { category_id: options.category_id });
    }

    if (options.course_level) {
      queryBuilder.andWhere('course.level = :course_level', { course_level: options.course_level });
    }

    if (options.min_price !== undefined) {
      queryBuilder.andWhere('COALESCE(prices.discount_price, prices.price) >= :min_price', { min_price: options.min_price });
    }

    if (options.max_price !== undefined) {
      queryBuilder.andWhere('COALESCE(prices.discount_price, prices.price) <= :max_price', { max_price: options.max_price });
    }

    if (options.min_rating !== undefined || options.max_rating !== undefined) {
      const subQuery = this.courseRepository.manager.createQueryBuilder(CourseRating, 'r')
        .select('r.course_id')
        .groupBy('r.course_id');

      if (options.min_rating !== undefined) {
        subQuery.having('AVG(r.rating) >= :min_rating', { min_rating: options.min_rating });
      }
      if (options.max_rating !== undefined) {
        if (options.min_rating !== undefined) {
          subQuery.andHaving('AVG(r.rating) <= :max_rating', { max_rating: options.max_rating });
        } else {
          subQuery.having('AVG(r.rating) <= :max_rating', { max_rating: options.max_rating });
        }
      }

      queryBuilder.andWhere(`course.id IN (${subQuery.getQuery()})`, subQuery.getParameters());
    }

    if (options.sort_by === 'price_asc') {
      queryBuilder.orderBy('COALESCE(prices.discount_price, prices.price)', 'ASC');
    } else if (options.sort_by === 'price_desc') {
      queryBuilder.orderBy('COALESCE(prices.discount_price, prices.price)', 'DESC');
    } else if (options.sort_by === 'rating_desc') {
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(AVG(r.rating), 0)', 'avg_rating')
          .from(CourseRating, 'r')
          .where('r.course_id = course.id');
      }, 'avg_rating');
      queryBuilder.orderBy('avg_rating', 'DESC');
    } else if (options.sort_by === 'rating_asc') {
      queryBuilder.addSelect((subQuery) => {
        return subQuery
          .select('COALESCE(AVG(r.rating), 0)', 'avg_rating')
          .from(CourseRating, 'r')
          .where('r.course_id = course.id');
      }, 'avg_rating');
      queryBuilder.orderBy('avg_rating', 'ASC');
    } else {
      queryBuilder.orderBy('course.created_at', 'DESC');
    }

    const [items, totalItems] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const locale = localeStorage.getStore() || 'en';
    const mappedItems = items.map((course) => {
      let translation = course.translations.find((t) => t.language.code === locale);

      if (!translation && locale !== 'en') {
        translation = course.translations.find((t) => t.language.code === 'en');
      }

      if (!translation && course.translations.length > 0) {
        translation = course.translations[0];
      }

      let categoryData: any = null;
      if (course.category) {
        let catTranslation = course.category.translations?.find((t) => t.language.code === locale);
        if (!catTranslation && locale !== 'en') {
          catTranslation = course.category.translations?.find((t) => t.language.code === 'en');
        }
        if (!catTranslation && course.category.translations?.length > 0) {
          catTranslation = course.category.translations[0];
        }
        categoryData = {
          id: course.category.id,
          parent_id: course.category.parent_id,
          is_active: course.category.is_active,
          created_by: course.category.created_by,
          created_at: course.category.created_at,
          updated_at: course.category.updated_at,
          name: catTranslation ? catTranslation.title : '',
          title: catTranslation ? catTranslation.title : '',
        };
      }

      return {
        id: course.id,
        category_id: course.category_id,
        type: course.type,
        level: course.level,
        slug: course.slug,
        thumbnail: course.thumbnail,
        image: course.image,
        language: course.language,
        topics: course.topics,
        status: course.status,
        created_by: course.created_by,
        updated_by: course.updated_by,
        title: translation ? translation.title : '',
        description: translation ? translation.description : '',
        overview: translation ? translation.overview : '',
        category: categoryData,
        price: course.prices && course.prices.length > 0 ? course.prices[0] : null,
        created_at: course.created_at,
        updated_at: course.updated_at,
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items: mappedItems,
      pagination: {
        totalItems,
        itemCount: mappedItems.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // Find course entity by ID helper
  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: {
        translations: {
          language: true,
        },
        category: {
          translations: {
            language: true,
          },
        },
        creator: true,
        updater: true,
        prices: true,
      },
    });

    if (!course) {
      throw new NotFoundException(trans('course.not_found'));
    }

    return course;
  }

  // Get course by ID, localized
  async findOneLocalized(id: string): Promise<any> {
    const course = await this.findOne(id);
    const locale = localeStorage.getStore() || 'en';

    let translation = course.translations.find((t) => t.language.code === locale);
    if (!translation && locale !== 'en') {
      translation = course.translations.find((t) => t.language.code === 'en');
    }
    if (!translation && course.translations.length > 0) {
      translation = course.translations[0];
    }

    let categoryData: any = null;
    if (course.category) {
      let catTranslation = course.category.translations?.find((t) => t.language.code === locale);
      if (!catTranslation && locale !== 'en') {
        catTranslation = course.category.translations?.find((t) => t.language.code === 'en');
      }
      if (!catTranslation && course.category.translations?.length > 0) {
        catTranslation = course.category.translations[0];
      }
      categoryData = {
        id: course.category.id,
        parent_id: course.category.parent_id,
        is_active: course.category.is_active,
        created_by: course.category.created_by,
        created_at: course.category.created_at,
        updated_at: course.category.updated_at,
        name: catTranslation ? catTranslation.title : '',
        title: catTranslation ? catTranslation.title : '',
      };
    }

    return {
      id: course.id,
      category_id: course.category_id,
      type: course.type,
      level: course.level,
      slug: course.slug,
      thumbnail: course.thumbnail,
      image: course.image,
      language: course.language,
      topics: course.topics,
      status: course.status,
      created_by: course.created_by,
      updated_by: course.updated_by,
      title: translation ? translation.title : '',
      description: translation ? translation.description : '',
      overview: translation ? translation.overview : '',
      category: categoryData,
      price: course.prices && course.prices.length > 0 ? course.prices[0] : null,
      created_at: course.created_at,
      updated_at: course.updated_at,
    };
  }

  // Update course and its translations
  async update(id: string, updateDto: UpdateCourseDto, userId: string): Promise<{ message: string; data: Course }> {
    const course = await this.findOne(id);

    // Verify category exists if updated
    if (updateDto.category_id) {
      const categoryExists = await this.categoryRepository.findOne({
        where: { id: updateDto.category_id },
      });
      if (!categoryExists) {
        throw new NotFoundException(trans('course.category_not_found'));
      }
      course.category_id = updateDto.category_id;
    }

    // Verify slug unique if updated
    if (updateDto.slug && updateDto.slug !== course.slug) {
      const slugExists = await this.courseRepository.findOne({
        where: { slug: updateDto.slug },
      });
      if (slugExists) {
        throw new ConflictException(trans('course.slug_exists'));
      }
      course.slug = updateDto.slug;
    }

    // Update core fields
    if (updateDto.type !== undefined) course.type = updateDto.type;
    if (updateDto.level !== undefined) course.level = updateDto.level;
    if (updateDto.thumbnail !== undefined) course.thumbnail = updateDto.thumbnail;
    if (updateDto.image !== undefined) course.image = updateDto.image;
    if (updateDto.language !== undefined) course.language = updateDto.language;
    if (updateDto.topics !== undefined) course.topics = updateDto.topics;
    if (updateDto.status !== undefined) course.status = updateDto.status;
    course.updated_by = userId;

    const savedCourse = await this.courseRepository.save(course);

    // Update translations if provided
    if (updateDto.translations) {
      const payloadLangCodes = updateDto.translations.map((t) => t.languageCode);
      const existingTranslations = await this.translationRepository.find({
        where: { course_id: id },
        relations: { language: true },
      });

      // Remove translations not in update payload
      for (const extT of existingTranslations) {
        if (!payloadLangCodes.includes(extT.language.code)) {
          await this.translationRepository.remove(extT);
        }
      }

      // Upsert payload translations
      for (const tDto of updateDto.translations) {
        const lang = await this.languageRepository.findOne({
          where: { code: tDto.languageCode },
        });

        if (!lang) {
          throw new NotFoundException(trans('course.lang_not_found', { code: tDto.languageCode }));
        }

        const existingT = existingTranslations.find((extT) => extT.language.code === tDto.languageCode);

        if (existingT) {
          existingT.title = tDto.title;
          existingT.description = tDto.description || null;
          existingT.overview = tDto.overview || null;
          await this.translationRepository.save(existingT);
        } else {
          const newT = this.translationRepository.create({
            course_id: id,
            language_id: lang.id,
            title: tDto.title,
            description: tDto.description || null,
            overview: tDto.overview || null,
          });
          await this.translationRepository.save(newT);
        }
      }
    }

    if (updateDto.hasOwnProperty('price')) {
      // Remove old prices
      const existingPrices = await this.priceRepository.find({ where: { course_id: id } });
      await this.priceRepository.remove(existingPrices);

      if (updateDto.price) {
        // Create new price
        const pDto = updateDto.price;
        const newPrice = this.priceRepository.create({
          course_id: id,
          currency: pDto.currency,
          price: pDto.price,
          discount_price: pDto.discount_price || null,
          discount_type: pDto.discount_type || null,
          discount_value: pDto.discount_value || null,
          discount_start_at: pDto.discount_start_at || null,
          discount_end_at: pDto.discount_end_at || null,
          created_by: userId,
          updated_by: userId,
        });
        await this.priceRepository.save(newPrice);
      }
    }

    // Reload localized
    const updatedCourse = await this.findOneLocalized(id);

    return {
      message: trans('course.updated'),
      data: updatedCourse,
    };
  }

  // Delete a course
  async remove(id: string): Promise<{ message: string }> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);

    return {
      message: trans('course.deleted'),
    };
  }
}
