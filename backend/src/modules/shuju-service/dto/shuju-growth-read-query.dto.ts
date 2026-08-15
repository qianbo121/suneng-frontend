import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class ShujuGrowthReadQueryDto {
  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsIn(['all', 'zh', 'en'])
  site?: 'all' | 'zh' | 'en';

  @IsOptional()
  @IsIn(['all', 'PC', '移动端'])
  device?: 'all' | 'PC' | '移动端';

  @IsOptional()
  @IsIn(['all', '自然搜索', 'AI引流', '直接访问', '外部链接'])
  sourceType?: 'all' | '自然搜索' | 'AI引流' | '直接访问' | '外部链接';

  @IsOptional()
  @IsIn(['all', '产品页', '解决方案页', '文章页', '案例页', '联系页', '首页', '其他页'])
  pageType?: 'all' | '产品页' | '解决方案页' | '文章页' | '案例页' | '联系页' | '首页' | '其他页';
}
