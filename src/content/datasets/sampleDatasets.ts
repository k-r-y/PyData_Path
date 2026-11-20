export interface SampleDataset {
  id: string;
  name: string;
  filename: string;
  description: string;
  csv: string;
}

/**
 * Synthetic datasets generated specifically for PyData Path practice labs.
 * Contains no real personal or sensitive data (per RULES.md).
 */
export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'store_sales',
    name: 'Campus Store Sales (Synthetic)',
    filename: 'store_sales.csv',
    description: '10 synthetic retail transactions for an IS inventory & sales scenario.',
    csv: `order_id,date,category,item,units,unit_price,region
1001,2026-01-05,Electronics,USB-C Hub,3,24.50,North
1002,2026-01-06,Stationery,Grid Notebook,10,4.25,South
1003,2026-01-07,Electronics,Wireless Mouse,5,18.00,North
1004,2026-01-08,Accessories,Laptop Sleeve,2,22.00,East
1005,2026-01-09,Stationery,Gel Pen Pack,8,6.50,West
1006,2026-01-10,Electronics,USB-C Hub,4,24.50,South
1007,2026-01-11,Accessories,Desk Mat,3,15.00,North
1008,2026-01-12,Stationery,Grid Notebook,12,4.25,East
1009,2026-01-13,Electronics,Mechanical Keypad,2,45.00,West
1010,2026-01-14,Accessories,Laptop Sleeve,5,22.00,North`,
  },
  {
    id: 'student_enrollments',
    name: 'IS Course Enrollments (Synthetic)',
    filename: 'student_enrollments.csv',
    description: '8 synthetic IS course sections with enrollment counts and capacities.',
    csv: `course_code,title,semester,enrolled,capacity,instructor_dept
IS-101,Intro to Information Systems,2026-1,44,45,IS
IS-204,Database Management,2026-1,38,40,IS
IS-301,Business Analytics,2026-1,40,40,IS
IS-305,Systems Analysis,2026-1,31,35,IS
CS-102,Programming Logic,2026-1,48,50,CS
IS-310,Enterprise Architecture,2026-1,27,30,IS
IS-320,Data Visualization,2026-1,35,35,IS
IS-401,Capstone Project,2026-1,29,30,IS`,
  },
];
