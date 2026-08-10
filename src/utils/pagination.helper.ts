export interface PaginatedResult<T> {
  items: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export async function paginate<T>(
  repository: any,
  options: { page?: number; limit?: number },
  findOptions: any = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, Number(options.page || 1));
  const limit = Math.max(1, Number(options.limit || 10));
  const skip = (page - 1) * limit;

  const [items, totalItems] = await repository.findAndCount({
    ...findOptions,
    skip,
    take: limit,
  });

  const totalPages = Math.ceil(totalItems / limit);

  return {
    items,
    meta: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    },
  };
}
