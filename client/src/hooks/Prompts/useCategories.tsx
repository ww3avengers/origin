import { useGetCategories } from '~/data-provider';
import CategoryIcon from '~/components/Prompts/Groups/CategoryIcon';
import { useT } from '~/utils/i18n';

const useCategories = (className = '') => {
  const t = useT();

  const loadingCategories = [
    {
      label: t('com_ui_loading'),
      value: '',
    },
  ];

  const emptyCategory = {
    label: t('com_ui_empty_category'),
    value: '',
  };

  const { data: categories = loadingCategories } = useGetCategories({
    select: (data) =>
      data.map((category) => ({
        label: t(category.label as string),
        value: category.value,
        icon: category.value ? (
          <CategoryIcon category={category.value} className={className} />
        ) : null,
      })),
  });

  return { categories, emptyCategory };
};

export default useCategories;
