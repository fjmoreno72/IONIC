# Component System Documentation

This documentation covers the component architecture and design system used throughout the application, focusing on reusable components and consistent styling.

## Table of Contents
1. [Data Table Component](#data-table-component)
2. [Design System](#design-system)

# Data Table Component

This section explains the component architecture used for data tables in the application. The system provides a reusable, consistent way to display tabular data with features like sorting, filtering, pagination, and more.

## Components Overview

The component system consists of three main parts:

1. **HTML Template** (`templates/components/dataTable.html`): Defines the markup structure
2. **JavaScript Core** (`static/js/components/tableCore.js`): Provides the data handling logic
3. **CSS Styles** (`static/css/components/dataTable.css`): Provides consistent styling

## Using the Component

### 1. Include the Component in a Page

Include the data table component in any template like this:

```html
{% with 
    table_id = "myTable",
    table_body_id = "myTableBody",
    items_per_page_id = "itemsPerPageSelect",
    page_info_id = "pageInfo",
    prev_button_id = "prevPageButton",
    next_button_id = "nextPageButton",
    columns = [
        {'label': 'ID', 'sortable': true, 'sort_key': 'id', 'width': '10%'},
        {'label': 'Name', 'sortable': true, 'sort_key': 'name', 'width': '45%'},
        {'label': 'Type', 'sortable': true, 'sort_key': 'type', 'width': '20%'},
        {'label': 'Status', 'sortable': false, 'width': '25%'}
    ]
%}
    {% include 'components/dataTable.html' %}
{% endwith %}
```

### 2. Create a JavaScript Controller

Create a JavaScript file that imports and initializes the DataTable class:

```javascript
// mypage.js
import { DataTable } from '../components/tableCore.js';
import { ColumnResizer } from '../components/columnResizer.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize column resizer
  const columnResizer = new ColumnResizer('.test-cases-table');
  
  // Configure and initialize the data table
  const myTable = new DataTable({
    // Basic configuration
    tableId: 'myTable',
    tableBodyId: 'myTableBody',
    dataUrl: '/path/to/data.json',
    searchInputId: 'searchInput',
    itemsPerPageSelectId: 'itemsPerPageSelect',
    pageInfoId: 'pageInfo',
    prevButtonId: 'prevPageButton',
    nextButtonId: 'nextPageButton',
    
    // Optional configuration
    defaultSortField: 'id',
    noResultsMessage: 'No items found.',
    
    // Column definitions
    columns: [
      { key: 'id', label: 'ID', sortable: true },
      { key: 'name', label: 'Name', sortable: true },
      { 
        key: 'type', 
        label: 'Type', 
        sortable: true,
        cellClass: 'type-column'
      },
      { 
        key: 'status', 
        label: 'Status', 
        sortable: false,
        render: (value, row) => `<span class="status-${value}">${value}</span>`
      }
    ],
    
    // Event handlers
    onFetchStart: () => {
      // Do something when data fetch starts
    },
    
    onFetchComplete: () => {
      // Do something when data fetch completes
    },
    
    onFetchError: (error) => {
      console.error('Error fetching data:', error);
    },
    
    onRenderComplete: (itemCount) => {
      // Do something after table renders
    },
    
    // Custom filter function
    filterFunction: (item, searchTerm) => {
      // Custom filtering logic
      const basicMatch = (item.name?.toLowerCase() || '').includes(searchTerm) || 
                       (item.id?.toLowerCase() || '').includes(searchTerm);
      
      return basicMatch;
    },
    
    // Custom sort function
    customSort: (field, a, b, direction) => {
      // Custom sorting logic for specific fields
      if (field === 'someField') {
        // Custom logic
        // Return comparison result (1, -1, or 0)
      }
      // Return null to use default sort logic
      return null;
    }
  });
  
  // Add event listeners for dropdown filters if needed
  const typeFilter = document.getElementById('typeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', () => {
      myTable.filterAndRender();
    });
  }
});
```

### 3. Define Table-specific CSS (Optional)

Add table-specific column styles if needed:

```css
/* In your CSS file or in the dataTable.css file */
#myTable th:nth-child(1), #myTable td:nth-child(1) { /* ID Column */
    width: 10%;
    min-width: 80px;
}
#myTable th:nth-child(2), #myTable td:nth-child(2) { /* Name Column */
    width: 45%;
    min-width: 200px;
}
/* etc. */
```

## DataTable Configuration Options

### Required Options

- `tableId`: ID of the table element
- `tableBodyId`: ID of the table body element
- `dataUrl`: URL to fetch JSON data
- `searchInputId`: ID of the search input element
- `itemsPerPageSelectId`: ID of the items per page select element
- `pageInfoId`: ID of the page info element
- `prevButtonId`: ID of the previous page button
- `nextButtonId`: ID of the next page button

### Optional Options

- `defaultSortField`: Default field to sort by (default: first sortable column)
- `defaultSortDirection`: Default sort direction ('asc' or 'desc', default: 'asc')
- `noResultsMessage`: Message to display when no results are found
- `filterFunction`: Custom function to filter data based on search input
- `customSort`: Custom function for sorting specific fields
- `columns`: Column definitions (required if not provided in the HTML template)

### Event Handlers

- `onFetchStart`: Called when data fetch starts
- `onFetchComplete`: Called when data fetch completes
- `onFetchError`: Called when data fetch fails
- `onRenderComplete`: Called when table rendering completes

## Column Configuration Options

Each column can have the following options:

- `key`: Property name in the data object (required)
- `label`: Column header label (required)
- `sortable`: Whether the column is sortable (default: false)
- `cellClass`: CSS class to add to the column cells
- `render`: Custom function to render cell content

Example render function:

```javascript
render: (value, row) => {
  if (value === 'active') {
    return `<span class="badge bg-success">Active</span>`;
  } else {
    return `<span class="badge bg-danger">Inactive</span>`;
  }
}
```

## Examples

See these implementations for real-world examples:

- GPs page: `templates/pages/gps_new.html` and `static/js/pages/gps_new.js`
- Services page: `templates/pages/services_new.html` and `static/js/pages/services_new.js`
- SPs page: `templates/pages/sps_new.html` and `static/js/pages/sps_new.js`
- Affiliates page: `templates/pages/affiliates_new.html` and `static/js/pages/affiliates_new.js`

## Adding New Features

To extend the component system:

1. Modify `tableCore.js` to add core functionality
2. Update the component template if the UI needs to change
3. Add new CSS styles if needed
4. Update this documentation

## Troubleshooting

- If column widths are not applied correctly, check the CSS selectors
- If data is not loading, check the network request to the data URL
- If filtering is not working correctly, check the filterFunction implementation
- If sorting is not working correctly, check the customSort implementation

# Design System

The application uses a comprehensive design system to maintain visual consistency across all components. The design system is implemented in CSS with custom properties (CSS variables) that can be used throughout the application.

## Files

- **`static/css/components/design-system.css`**: Contains all design tokens and utility classes

## Color System

The design system includes a complete color palette with primary, secondary, success, warning, danger, and neutral colors. Each color has light, dark, and contrast variants.

### Usage

```css
/* Using color variables in your CSS */
.my-element {
  background-color: var(--primary-color);
  color: var(--primary-contrast);
  border: 1px solid var(--border-color);
}
```

### Dark Mode Support

The design system fully supports dark mode through the `[data-theme="dark"]` attribute. Colors are automatically adjusted for dark mode when this attribute is present on the document element.

```javascript
// Toggle dark mode
function toggleTheme() {
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? '' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
```

## Typography

The design system includes typography variables for font family, size, line height, and weight.

```css
/* Using typography variables */
.heading {
  font-family: var(--font-family-base);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
}
```

## Spacing

A consistent spacing scale is provided to maintain rhythm throughout the UI.

```css
/* Using spacing variables */
.card {
  padding: var(--space-4);
  margin-bottom: var(--space-5);
  gap: var(--space-2);
}
```

## Borders & Shadows

Standardized border radius, width, and box shadows are available for consistent component styling.

```css
/* Using border and shadow variables */
.button {
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.button:hover {
  box-shadow: var(--shadow-md);
}
```

## Utility Classes

The design system provides utility classes for common styling needs.

```html
<!-- Using utility classes in HTML -->
<div class="bg-primary text-white shadow-md border-radius-lg">
  <span class="text-muted">Some content</span>
</div>
```

## Extending the Design System

When adding new components or styles:

1. Use existing design tokens from the design system where possible
2. If new design tokens are needed, add them to the design-system.css file
3. Follow the established naming conventions for consistency
4. Add appropriate dark mode variants for new styles

## Best Practices

- Always use the design system variables instead of hardcoded values
- Use utility classes for one-off styling needs
- Test all components in both light and dark modes
- Maintain responsive design principles using the spacing system
