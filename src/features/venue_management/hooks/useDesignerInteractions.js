import { useState, useCallback } from 'react';

const useDesignerInteractions = () => {
    const [isEraserActive, setIsEraserActive] = useState(false);
    const [draggedItemPreview, setDraggedItemPreview] = useState(null); // { r, c, w, h, isValid } | null

    // --- States for Kitchen Definition (if feature is kept) ---
    // const [isDefiningKitchen, setIsDefiningKitchen] = useState(false);
    // const [kitchenCorner1, setKitchenCorner1] = useState(null); // { r, c } or null

    const toggleEraser = useCallback(() => {
        setIsEraserActive(prev => !prev);
        // if (!prev) { // If eraser is being activated
        //     setIsDefiningKitchen(false); // Ensure other modes are off
        //     setKitchenCorner1(null);
        // }
    }, []);

    const updateDraggedItemPreview = useCallback((previewData) => {
        setDraggedItemPreview(previewData);
    }, []);

    // --- Callbacks for Kitchen Definition (if feature is kept) ---
    // const startDefiningKitchen = useCallback(() => {
    //     setIsDefiningKitchen(true);
    //     setKitchenCorner1(null);
    //     setIsEraserActive(false); // Ensure eraser is off
    // }, []);

    // const cancelDefiningKitchen = useCallback(() => {
    //     setIsDefiningKitchen(false);
    //     setKitchenCorner1(null);
    // }, []);

    // const setKitchenSelectionCorner = useCallback((r, c) => {
    //     // This function would typically be called by a grid cell click handler.
    //     // If it's the first corner, setKitchenCorner1.
    //     // If it's the second, the logic to finalize the kitchen area would be in
    //     // useLayoutDesignerStateManagement (e.g., via a call to defineKitchen(kitchenCorner1, {r,c}) )
    //     // For now, this hook just manages the UI state of selection.
    //     if (!isDefiningKitchen) return;

    //     if (!kitchenCorner1) {
    //         setKitchenCorner1({ r, c });
    //     } else {
    //         // The actual setting of definedKitchenArea happens in useLayoutDesignerStateManagement
    //         // This function's role might be just to update a temporary visual preview for the selection rect
    //         // before confirming, or simply to pass both corners up.
    //         // For simplicity, we'll assume the second click triggers an action in the parent.
    //         // The parent (LayoutDesignerGrid or LayoutDesigner) would then call
    //         // a function from useLayoutDesignerStateManagement.
    //         // After the kitchen area is defined (or cancelled), the parent should call
    //         // cancelDefiningKitchen() to reset this UI state.
    //     }
    // }, [isDefiningKitchen, kitchenCorner1]);


    return {
        isEraserActive,
        toggleEraser,

        draggedItemPreview,
        updateDraggedItemPreview,

        // --- Kitchen Definition Exports (if feature is kept) ---
        // isDefiningKitchen,
        // kitchenCorner1, // Could be used for visual feedback of the first selected corner
        // startDefiningKitchen,
        // cancelDefiningKitchen,
        // setKitchenSelectionCorner, // Or a simpler mechanism to get both corners
    };
};

export default useDesignerInteractions;