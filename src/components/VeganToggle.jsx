// src/components/VeganToggle.jsx
import useVeganStore from '../store/useVeganStore';
import { LeafIcon } from '../icons/LeafIcon';
import { MeatIcon } from '../icons/MeatIcon';

export default function VeganToggle() {
  const { isVeganMode, toggleVeganMode } = useVeganStore();

  return (
    <button
      onClick={toggleVeganMode}
      className="vegantoggle-btn"
      title={isVeganMode ? "Switch to Normal Mode" : "Switch to Vegan Mode"}
    >
      {isVeganMode ? <LeafIcon /> : <MeatIcon />}
    </button>
  );
}