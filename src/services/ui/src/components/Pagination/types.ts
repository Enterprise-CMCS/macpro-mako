export interface Props {
  count: number;
  onPageChange: (page: number) => void;
  onSizeChange?: (size: number) => void;
  pageNumber: number;
  pageSize: number;
}
