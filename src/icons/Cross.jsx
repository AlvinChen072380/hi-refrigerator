export const Cross = ({ size = 24, className = "" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size}/*  */
      height={size}/*  */
      fill="none" 
      viewBox="0 0 24 24" 
      strokewidth="1.5" 
      stroke="currentColor" /* 關鍵屬性，影響顏色變化 */
      strokeLinecap="round" 
      strokeLinejoin="round"
      class="icon"
      id="cross"
      className={className}/*  */
    >
    <path 
      id="primary-stroke" 
      d="M19,19,5,5M19,5,5,19" 
      />
    </svg>

  )
}