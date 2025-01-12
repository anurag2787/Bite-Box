import React from "react";

// Define styled block components outside the render function
const HeaderOne = (props) => (
  <h1
    className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100"
    {...props}
  />
);
HeaderOne.displayName = "HeaderOne";

const HeaderTwo = (props) => (
  <h2
    className="text-3xl font-semibold mb-3 text-gray-800 dark:text-gray-200"
    {...props}
  />
);
HeaderTwo.displayName = "HeaderTwo";

const Blockquote = (props) => (
  <blockquote
    className="border-l-4 border-gray-400 pl-4 py-2 my-4 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-r-lg"
    {...props}
  />
);
Blockquote.displayName = "Blockquote";

const Unstyled = (props) => (
  <p
    className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300"
    {...props}
  />
);
Unstyled.displayName = "Unstyled";

// Main component
const RecipeDetailsPage = ({ content }) => {
  const renderStyledContent = (content) => {
    if (!content || !content.blocks) return null;

    return content.blocks.map((block, index) => {
      const { text, type, inlineStyleRanges } = block;

      // Choose the appropriate styled block component
      let StyledBlock;
      switch (type) {
        case "header-one":
          StyledBlock = HeaderOne;
          break;
        case "header-two":
          StyledBlock = HeaderTwo;
          break;
        case "blockquote":
          StyledBlock = Blockquote;
          break;
        case "unstyled":
        default:
          StyledBlock = Unstyled;
      }

      // Handle inline styles like bold, italic, and underline
      let styledText = text;
      if (inlineStyleRanges.length > 0) {
        inlineStyleRanges.forEach((range) => {
          const { offset, length, style } = range;
          const start = styledText.slice(0, offset);
          const middle = styledText.slice(offset, offset + length);
          const end = styledText.slice(offset + length);

          let styledFragment;
          switch (style) {
            case "BOLD":
              styledFragment = (
                <strong className="font-bold text-gray-900 dark:text-gray-100">
                  {middle}
                </strong>
              );
              break;
            case "ITALIC":
              styledFragment = (
                <em className="italic text-gray-700 dark:text-gray-300">
                  {middle}
                </em>
              );
              break;
            case "UNDERLINE":
              styledFragment = (
                <u className="underline text-gray-800 dark:text-gray-200">
                  {middle}
                </u>
              );
              break;
            default:
              styledFragment = middle;
          }

          styledText = (
            <>
              {start}
              {styledFragment}
              {end}
            </>
          );
        });
      }

      // Render the styled block with the styled text
      return <StyledBlock key={index}>{styledText}</StyledBlock>;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="prose dark:prose-invert">
        {renderStyledContent(content)}
      </div>
    </div>
  );
};

export default RecipeDetailsPage;
