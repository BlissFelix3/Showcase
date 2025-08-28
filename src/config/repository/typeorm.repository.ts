import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import {
  EntityManager,
  EntityTarget,
  FindManyOptions,
  ObjectLiteral,
  Repository,
  FindOptionsOrder,
} from 'typeorm';

export class TypeOrmRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  constructor(
    private readonly entityTarget: EntityTarget<Entity>,
    private readonly entityManager: EntityManager,
  ) {
    super(entityTarget, entityManager);
  }

  findMany(
    options: IPaginationOptions,
    findOptions?: FindManyOptions<Entity>,
    orderOptions?: FindOptionsOrder<Entity>,
  ): Promise<Pagination<Entity>> {
    const optionsWithOrder = { ...findOptions, order: orderOptions };
    return paginate<Entity>(this, options, optionsWithOrder);
  }
}
