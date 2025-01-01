# Style Refactoring Decisions

## Classes to Keep Inline

### Layout-specific Classes
- Grid system classes (highly layout-specific):
  - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - `grid-cols-2`
- Spacing utilities when used for specific layout adjustments:
  - `gap-4`, `gap-6`
  - `mt-4`, `mb-4` (when used for specific component spacing)
- Flex layout when component-specific:
  - `flex justify-between items-center` (in history items)
  - `flex justify-center items-center` (in auth layout)

### One-off Utility Classes
- Dynamic classes (used in v-bind):
  - `:class="{ 'badge-info': type === 'search', ... }"`
- Single-use utility classes:
  - `w-96` (specific to auth card width)

## Classes to Move to <style>

### Typography Patterns
1. Page Headers:
   - `text-3xl font-bold mb-8` → `.page-header`
2. Card Titles:
   - `text-2xl font-bold` → `.card-title`
3. Temperature Display:
   - `text-4xl font-bold my-4` → `.temperature`
4. Metadata Text:
   - `text-sm opacity-70` → `.meta-text`

### Card Patterns
1. Base Card:
   - `card bg-base-100 shadow-xl` → `.base-card`
2. Card Body:
   - `card-body` → `.card-content`

### Badge Patterns
1. Base Badge:
   - `badge` → `.status-badge`
2. Badge Variants:
   - Create modifiers for info/success/warning variants

### Loading States
1. Loading Container:
   - `text-center py-8` → `.loading-container`

## Component-Specific Classes

### WeatherCard
1. Stats Grid:
   - Create `.weather-stats-grid` for stats layout
2. Favorite Button:
   - Create `.favorite-button` for star button styling

### HistoryView
1. History Item:
   - Create `.history-item` for consistent item styling
2. Timestamp:
   - Create `.timestamp` for consistent time display

### Auth Views
1. Auth Container:
   - Create `.auth-container` for centered layout
2. Auth Card:
   - Create `.auth-card` for consistent card styling

## Implementation Guidelines
1. Use `<style scoped>` in all components
2. Use `@apply` for composing Tailwind utilities
3. Keep class names semantic and component-specific
4. Maintain responsive classes within style definitions
