class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };
    // Removing fields from the query
    const removeFields = ["keyword", "limit", "page"];
    removeFields.forEach((el) => delete queryCopy[el]);
    // Advance filter for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  pagination(resultPerPage,page) {
    // Ensure resultPerPage is a positive integer
    if (typeof resultPerPage !== "number" || resultPerPage <= 0) {
      throw new Error("resultPerPage must be a positive number");
    }

    // Get the current page from the query string, defaulting to 1
    const currentPage = Math.max(Number(this.queryStr.page) || 1, 1); // Ensure currentPage is at least 1

    // Calculate the number of documents to skip
    const skip = resultPerPage * (currentPage - 1);

    // Apply limit and skip to the query
    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = (query, queryStr) => {
  return new ApiFeatures(query, queryStr);
};
