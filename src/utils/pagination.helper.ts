export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
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
    pagination: {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
