export interface SpecsType {
  id: string
  name: string
  netWeight?: number
  grossWeight?: number
  length: number
  width: number
  height: number
}

export interface CargoType {
  id?: string
  cargoId?: string
  name?: string
  length?: number
  width?: number
  height?: number
  relativeLength?: number
  relativeWidth?: number
  relativeHeight?: number
  netWeight?: number
  grossWeight?: number
  place?: 1 | 2 | 3 | 4 | 5 | 6
  mixedRowsCount?: number
  mixedTotalLength?: number
  mixedTotalBoxes?: number
}
