You must schedule `num_courses` labeled `0..num_courses-1` given pairs `[course, prereq]` meaning `prereq` must be completed before `course`. Whenever multiple courses have all prerequisites satisfied, pick the **smallest course ID** first.

Write `course_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]` returning the valid order, or `[]` if a prerequisite cycle makes completion impossible.
