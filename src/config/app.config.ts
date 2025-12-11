export const appConfig = () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: process.env.FE_URL || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL,
  },

  pagination: {
    company_jobs_per_page: 2,
    cv_list_per_page: 2,
    company_list_per_page: 6,
  },
});