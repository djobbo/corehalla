/**
 * True when the element is a text-entry control that should keep its keystrokes.
 *
 * The global `/` shortcut used to skip only `<input>` elements, so typing `/`
 * inside the landing composer's `<textarea>` opened the command bar instead of
 * inserting the character.
 */
export const isTextEntryTarget = (element: Element | null): boolean => {
    if (!element) return false
    if (element instanceof HTMLInputElement) return true
    if (element instanceof HTMLTextAreaElement) return true

    return element instanceof HTMLElement && element.isContentEditable
}
