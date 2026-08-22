// Sample-page previews for specific Sanity resources, keyed by resource _id.
// Not stored in Sanity (no write access to that project) — merged onto the
// resource client-side instead. Shows one real page so buyers can see what
// they're getting; the rest of the document is shown locked.
import ffcClassPage3 from "Assets/Images/ffc-class-preview/page-3.png";
import ffcFeatureGuidePage3 from "Assets/Images/ffc-feature-guide-preview/page-3.png";
import ffcFeaturesWorkbookPage3 from "Assets/Images/ffc-features-workbook-preview/page-3.png";
import ffcFunctionGuidePage3 from "Assets/Images/ffc-function-guide-preview/page-3.png";
import ffcFunctionWorkbookPage3 from "Assets/Images/ffc-function-workbook-preview/page-3.png";

export const RESOURCE_PREVIEWS = {
  "0063aeaf-3355-42f2-9533-31482f8aa7f9": {
    // "FFC- Class Guide book"
    unlockedImage: ffcClassPage3,
    totalPages: 15,
  },
  "66a24624-06f8-4b54-9357-1f6a8f267545": {
    // "FFC- Feature Guide Book"
    unlockedImage: ffcFeatureGuidePage3,
    totalPages: 15,
  },
  "8f66126b-11a1-44b7-8f5c-5692c70d5caf": {
    // "FFC- Features Workbook"
    unlockedImage: ffcFeaturesWorkbookPage3,
    totalPages: 37,
  },
  "c10906d4-bc72-482e-b5c1-d11e097f7bd6": {
    // "FFC- Function Guide Book"
    unlockedImage: ffcFunctionGuidePage3,
    totalPages: 15,
  },
  "ffb1b868-2dc1-433e-af32-a4347ce8901c": {
    // "FFC- Function workbook"
    unlockedImage: ffcFunctionWorkbookPage3,
    totalPages: 37,
  },
};

export function getResourcePreview(id) {
  return RESOURCE_PREVIEWS[id] || null;
}
