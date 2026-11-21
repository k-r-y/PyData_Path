var e=`A monitoring service receives a telemetry stream \`events\` where each character represents a single event type code. An analyst wants to know the longest burst of consecutive events without any repeated code.

Write a function \`longest_unique_window(events)\` that returns the length of the longest contiguous substring of \`events\` containing no duplicate characters.

### Constraints
- \`0 <= len(events) <= 50,000\`
- Characters may be any valid Unicode character.

### Examples

**Example 1**
\`\`\`text
Input: events = "abcabcbb"
Output: 3
Explanation: The longest unique contiguous windows are "abc", "bca", and "cab", each of length 3.
\`\`\`

**Example 2**
\`\`\`text
Input: events = "zzzzz"
Output: 1
Explanation: Every character is 'z', so no unique window can have length greater than 1.
\`\`\`
`;export{e as default};