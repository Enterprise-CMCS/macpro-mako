import { useGetUser } from "@/api/useGetUser";
import { DetailSectionItem } from "@/pages/detail/setup/spa";

export const DetailItemsGrid = ({
  displayItems,
}: {
  displayItems: DetailSectionItem[];
}) => {
  const { data: user } = useGetUser();
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {displayItems.map(({ label, value, canView }) => {
          return !canView(user) ? null : (
            <div key={label}>
              <h3 className="text-sm">{label}</h3>
              {value}
            </div>
          );
        })}
      </div>
      <hr className="my-4" />
    </>
  );
};
