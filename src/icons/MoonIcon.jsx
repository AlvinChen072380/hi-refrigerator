
export const MoonIcon = ({ size = 24, className = "" }) => {
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
      class="size-6"
      className={className}/*  */
    >
    <path 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>

  )
}