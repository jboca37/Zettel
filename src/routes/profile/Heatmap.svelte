<script lang="ts">
  let {
    data = [],
    cellSize = 40,
    padding = 2,
    minColor = "hsl(60, 100%, 90%)", // Default: light yellow
    maxColor = "hsl(60, 100%, 50%)", // Default: dark yellow
  } = $props();

  // Flatten the 2D data array and filter out non-numeric values for min/max calculation
  const flatData = $derived(data.flat().filter((v) => typeof v === "number"));

  // Derive minimum and maximum values from the data
  // These are used to normalize values for color mapping
  const minValue = $derived(flatData.length > 0 ? Math.min(...flatData) : 0);
  const maxValue = $derived(
    flatData.length > 0
      ? Math.max(...flatData)
      : flatData.length > 0
        ? Math.min(...flatData)
        : 1,
  );
  // If maxValue would be equal to minValue (e.g. all data points are the same, or only one point),
  // the getColor function has a specific check for this.

  // Helper function to parse an HSL color string (e.g., "hsl(120, 50%, 70%)")
  // into an object { h, s, l }
  function parseHsl(hslColor: any) {
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) {
      console.warn(
        `Invalid HSL color format: ${hslColor}. Using default black.`,
      );
      return { h: 0, s: 0, l: 0 }; // Default to black if parsing fails
    }
    return {
      h: parseInt(match[1]),
      s: parseInt(match[2]),
      l: parseInt(match[3]),
    };
  }

  // Parse the min and max color strings into HSL objects
  const parsedMinColor = $derived(parseHsl(minColor));
  const parsedMaxColor = $derived(parseHsl(maxColor));

  // Function to determine the fill color for a cell based on its value
  function getColor(value: string) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "#efefef"; // Default color for non-numeric or NaN values
    }

    // If all values are the same, or only one value, use minColor
    if (maxValue === minValue) {
      return `hsl(${parsedMinColor.h}, ${parsedMinColor.s}%, ${parsedMinColor.l}%)`;
    }

    // Calculate the fraction representing the value's position between min and max
    const fraction = (value - minValue) / (maxValue - minValue);

    // Interpolate Hue, Saturation, and Lightness
    // This creates a smooth gradient between minColor and maxColor
    const h = Math.round(
      parsedMinColor.h + (parsedMaxColor.h - parsedMinColor.h) * fraction,
    );
    const s = Math.round(
      parsedMinColor.s + (parsedMaxColor.s - parsedMinColor.s) * fraction,
    );
    const l = Math.round(
      parsedMinColor.l + (parsedMaxColor.l - parsedMinColor.l) * fraction,
    );

    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  // Derive the number of rows and columns from the data
  const numRows = $derived(data.length);
  const numCols = $derived(
    data.length > 0 && Array.isArray(data[0]) ? data[0].length : 0,
  );

  // Calculate the total width and height of the SVG canvas
  const svgWidth = $derived(numCols * cellSize);
  const svgHeight = $derived(numRows * cellSize);
</script>

{#if numRows > 0 && numCols > 0}
  <svg
    width={svgWidth}
    height={svgHeight}
    class="heatmap-svg"
    aria-label="Heatmap"
  >
    {#each data as row, rowIndex}
      {#each row as value, colIndex}
        {@const cellFill = getColor(value)}
        <rect
          x={colIndex * cellSize + padding / 2}
          y={rowIndex * cellSize + padding / 2}
          width={cellSize - padding}
          height={cellSize - padding}
          fill={cellFill}
          rx="3"
          ry="3"
        >
          <title>{typeof value === "number" ? value.toFixed(2) : "N/A"}</title>
        </rect>
      {/each}
    {/each}
  </svg>
{:else}
  <p class="heatmap-no-data">
    No data provided or data is in incorrect format.
  </p>
{/if}

<style>
  .heatmap-svg {
    border: 1px solid #ccc;
    display: block; /* Allows margin auto to work */
    margin: 1em auto; /* Center the heatmap if it's narrower than its container */
    background-color: #f9f9f9; /* Light background for the SVG area */
  }

  rect {
    transition:
      stroke 0.2s ease-out,
      stroke-width 0.2s ease-out; /* Smooth transition for hover effect */
  }

  rect:hover {
    stroke: #333; /* Darker stroke on hover */
    stroke-width: 1.5px; /* Slightly thicker stroke on hover */
  }

  .heatmap-no-data {
    color: #777;
    text-align: center;
    padding: 20px;
    border: 1px dashed #ccc;
    margin: 1em auto;
    max-width: 300px;
  }
</style>
