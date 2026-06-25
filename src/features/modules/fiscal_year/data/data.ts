
const currentYear = new Date().getFullYear();
const startYear = currentYear - 1;
const endYear = currentYear;
const assessmentYear = `${startYear}-${endYear}`;
//startDate must be before endDate and 1st date april by default
// const startDate = new Date(currentYear, 3, 1);
// const endDate = new Date(currentYear + 1, 2, 31);
// console.log("Default Fiscal Year Start Date:", startDate);
// console.log("Default Fiscal Year Start Date:", startDate.toISOString().split('T')[0]);
// console.log("Default Fiscal Year End Date:", endDate);
export const defaultValues = {
    // id: undefined,
    name: '',
    startDate: startYear + "-04-01",
    endDate: endYear + "-03-31",
    assessmentYear: assessmentYear,
    companyId: 1,
    company: undefined,
    status: 'active',

    isEdit: false,
};