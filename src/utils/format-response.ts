import _ from 'lodash';

// Hàm chuyển đổi tất cả key từ snake_case → camelCase
export const formatResponse = (data: any) => {
  if (Array.isArray(data)) {
    return data.map((item) =>
      _.mapKeys(item, (value, key) => _.camelCase(key))
    );
  }
  return _.mapKeys(data, (value, key) => _.camelCase(key));
};
