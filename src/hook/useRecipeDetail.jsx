import { useState, useEffect } from "react";

export function useRecipeDetail() {
  const [selectedId, setSelectedId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) return;

    const fetchDetails = async () => {
      setIsModalLoading(true);
      try {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${selectedId}`
        );
        const data = await response.json();

        setModalData(data.meals[0]);
      } catch (error) {
        console.error("無法取得詳細資料:", error);
      } finally {
        setIsModalLoading(false);
      }
    };
    fetchDetails();
  }, [selectedId]);

  const handleShowDetails = (id) => {

    setModalData(null);
    setSelectedId(id);
  };

  const handleCloseModal = () => {
    setSelectedId(null);
  };

  return {
    selectedId,
    modalData,
    isModalLoading,
    handleShowDetails,
    handleCloseModal,
  };
}
