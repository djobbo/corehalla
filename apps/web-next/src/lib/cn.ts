/**
 * The project's class-name helper.
 *
 * Re-exported rather than reimplemented: shadcn's components import `cn`
 * straight from the `cn` package, and two implementations would disagree about
 * which of two conflicting Tailwind classes wins — the merge only works when
 * every caller goes through the same function.
 */
export { cn } from "cn"
