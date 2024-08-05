export function createNumberRange(start: number, end: number): number[] {
  return [...Array(end - start + 1)].map((_, idx) => start + idx);
}

export const pageStateResolver = ({
  pageNumber,
  pageSize,
  count,
}: {
  count: number;
  pageNumber: number;
  pageSize: number;
}) => {
  if (!count) {
    return {
      pageNumber,
      pageSize,
      count,
      lowerBoundValue: 0,
      upperBoundValue: 0,
      pageRange: [],
      nextDisabled: true,
      prevDisabled: true,
    };
  }

  const reducedCount = pageNumber * pageSize + pageSize;

  const pageCount = Math.ceil(count / pageSize);

  const pageRange = (() => {
    if (pageCount <= 7) return createNumberRange(1, pageCount);

    const leftLead = pageNumber <= 4 && pageCount > 7;
    if (leftLead) {
      return [1, 2, 3, 4, 5, createNumberRange(6, pageCount - 1), pageCount];
    }

    const rightLead = pageCount > 7 && pageNumber >= pageCount - 5;
    if (rightLead) {
      return [
        1,
        createNumberRange(2, pageCount - 5),
        ...createNumberRange(pageCount - 4, pageCount),
      ];
    }

    return [
      1,
      createNumberRange(2, pageNumber - 1),
      ...createNumberRange(pageNumber, pageNumber + 2),
      createNumberRange(pageNumber + 3, pageCount - 1),
      pageCount,
    ];
  })();

  return {
    pageRange,
    pageNumber,
    count,
    pageSize,
    lowerBoundValue: pageNumber * pageSize + 1,
    upperBoundValue: reducedCount > count ? count : reducedCount,
    nextDisabled: reducedCount >= count,
    prevDisabled: !pageNumber,
  };
};
