import isUndefined from 'lodash/isUndefined';

import { ActiveFilters, FilterCategory, Item, Repository } from '../types';
import getFoundationNameLabel from './getFoundationNameLabel';

const filterData = (items: Item[], activeFilters: ActiveFilters): Item[] => {
  if (Object.keys(activeFilters).length > 0) {
    const filteredItems: Item[] = items.filter((item: Item) => {
      // Filter Extra
      if (activeFilters[FilterCategory.Extra]) {
        if (
          activeFilters[FilterCategory.Extra].includes('specification') &&
          (isUndefined(item.specification) || !item.specification)
        ) {
          return false;
        }
      }

      // Filter Organization
      if (activeFilters[FilterCategory.Organization]) {
        if (isUndefined(item.crunchbase_data) || isUndefined(item.crunchbase_data.name)) {
          return false;
        } else if (!activeFilters[FilterCategory.Organization].includes(item.crunchbase_data.name)) {
          return false;
        }
      }

      // Filter Country
      if (activeFilters[FilterCategory.Country]) {
        let hasCountry = false;

        if (!isUndefined(item.crunchbase_data) && !isUndefined(item.crunchbase_data.country)) {
          hasCountry = activeFilters[FilterCategory.Country].includes(item.crunchbase_data.country);
        }

        if (!isUndefined(item.locations)) {
          item.locations!.forEach((location) => {
            if (activeFilters[FilterCategory.Country]!.includes(location.country)) {
              hasCountry = true;
            }
          });
        }

        if (!hasCountry) {
          return false;
        }
      }

      // Filter Industry
      if (activeFilters[FilterCategory.Industry]) {
        if (isUndefined(item.crunchbase_data) || isUndefined(item.crunchbase_data.categories)) {
          return false;
        } else if (
          !item.crunchbase_data.categories.some((c: string) => activeFilters[FilterCategory.Industry]?.includes(c))
        ) {
          return false;
        }
      }

      // License License
      if (activeFilters[FilterCategory.License]) {
        if (isUndefined(item.repositories)) {
          return false;
        } else {
          const licenses: string[] = [];
          item.repositories.forEach((repo: Repository) => {
            if (repo.github_data && repo.github_data.license) {
              licenses.push(repo.github_data.license);
            }
          });
          if (!licenses.some((l: string) => activeFilters[FilterCategory.License]?.includes(l))) {
            return false;
          }
        }
      }

      // Filter CompanyType
      if (activeFilters[FilterCategory.OrgType]) {
        if (isUndefined(item.crunchbase_data) || isUndefined(item.crunchbase_data.company_type)) {
          return false;
        } else if (!activeFilters[FilterCategory.OrgType].includes(item.crunchbase_data.company_type)) {
          return false;
        }
      }

      // Filter Tags
      if (activeFilters[FilterCategory.Tags]) {
        let hasTag = false;

        if (!isUndefined(item.summary) && !isUndefined(item.summary.tags)) {
          item.summary!.tags.forEach((tag) => {
            if (activeFilters[FilterCategory.Tags]!.includes(tag)) {
              hasTag = true;
            }
          });
        }

        if (!hasTag) {
          return false;
        }
      }

      // Filter TAG
      if (activeFilters[FilterCategory.TAG]) {
        if (isUndefined(item.tag)) {
          return false;
        } else if (!activeFilters[FilterCategory.TAG].includes(item.tag)) {
          return false;
        }
      }

      //  Maturity filter
      if (activeFilters[FilterCategory.Maturity]) {
        if (
          isUndefined(item.maturity) &&
          !activeFilters[FilterCategory.Maturity].includes(`non-${getFoundationNameLabel()}`)
        ) {
          return false;
        } else {
          if (!isUndefined(item.maturity) && !activeFilters[FilterCategory.Maturity].includes(item.maturity)) {
            return false;
          }
        }
      }

      return true;
    });

    return filteredItems;
  } else {
    return items;
  }
};

export default filterData;
