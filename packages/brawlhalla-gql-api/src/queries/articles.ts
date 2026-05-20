import { gql } from "../helpers/gql.js"

export const articlesQuery = (withContent: boolean) =>
    gql`
        query ($category: String, $after: String, $first: Int = 6) {
            posts(
                first: $first
                after: $after
                where: { categoryName: $category }
            ) {
                pageInfo {
                    endCursor
                }
                nodes {
                    title
                    slug
                    dateGmt
                    excerpt
                    ${withContent ? "content" : ""}
                    author {
                        node {
                            databaseId
                            name
                        }
                    }
                    categories {
                        nodes {
                            name
                            slug
                        }
                    }
                    featuredImage {
                        node {
                            sourceUrl
                            mediaDetails {
                                height
                                width
                                sizes {
                                    name
                                    mimeType
                                    sourceUrl
                                    width
                                    height
                                }
                            }
                        }
                    }
                }
            }
        }
    `
