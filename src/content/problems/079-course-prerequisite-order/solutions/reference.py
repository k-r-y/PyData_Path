import heapq


def course_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    adj = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for course, prereq in prerequisites:
        adj[prereq].append(course)
        indeg[course] += 1

    heap = [c for c in range(num_courses) if indeg[c] == 0]
    heapq.heapify(heap)
    order: list[int] = []
    while heap:
        cur = heapq.heappop(heap)
        order.append(cur)
        for nxt in adj[cur]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)
    return order if len(order) == num_courses else []
