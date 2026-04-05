import { config, fields, collection } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    recommendations: collection({
      label: "Recommendations",
      slugField: "title",
      path: "src/content/recommendations/*",
      format: { contentField: "body" },
      schema: {
        title: fields.text({
          label: "Title",
          validation: { isRequired: true },
        }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Artists", value: "artists" },
            { label: "Makers", value: "makers" },
            { label: "Small Shops", value: "small-shops" },
            { label: "Tea", value: "tea" },
            { label: "Books", value: "books" },
            { label: "Spirits", value: "spirits" },
            { label: "Gift Resources", value: "gift-resources" },
          ],
          defaultValue: "artists",
        }),
        url: fields.url({
          label: "External URL",
          validation: { isRequired: true },
        }),
        excerpt: fields.text({
          label: "Why I love this",
          multiline: true,
          validation: { isRequired: true },
        }),
        body: fields.markdoc({
          label: "Long form notes",
          options: {
            heading: true,
            link: true,
            divider: true,
          },
        }),
      },
    }),
    resources: collection({
      label: "Resources",
      slugField: "name",
      path: "src/content/resources/*",
      schema: {
        name: fields.text({ label: "Name", validation: { isRequired: true } }),
        url: fields.url({ label: "URL", validation: { isRequired: true } }),
        category: fields.select({
          label: "Category",
          options: [
            { label: "Organizations Doing Good", value: "orgs" },
            { label: "Places Hiring", value: "hiring" },
            { label: "Charities", value: "charities" },
          ],
          defaultValue: "orgs",
        }),
        description: fields.text({
          label: "Description",
          multiline: true,
          validation: { isRequired: true },
        }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
      },
    }),
  },
});
