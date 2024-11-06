import { CCard } from "@coreui/react-pro";

export default function Loading() {
  return (
<div className="flex justify-center items-center text-center w-full h-full">
  <div className="spinner-border" role="status">
    <span className="visually-hidden">Loading...</span>
  </div>
</div>  )
}
