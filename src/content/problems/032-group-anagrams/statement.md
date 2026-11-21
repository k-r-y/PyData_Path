In entity resolution pipelines, tokens that share the exact same multiset of characters (anagrams) often point to scrambled variants of the same identifier.

Write `group_anagrams(words: list[str]) -> list[list[str]]` that partitions `words` into groups of anagrams. Any order of groups and any order of words within each group is accepted, as long as duplicates in the input remain preserved.
