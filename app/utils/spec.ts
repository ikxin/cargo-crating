import { nanoid } from 'nanoid'

export const defaultTruckSpecs: SpecsType[] = [
  {
    id: nanoid(),
    name: '4.2米厢式货车',
    length: 4200,
    width: 2100,
    height: 2000,
  },
  {
    id: nanoid(),
    name: '6.8米厢式货车',
    length: 6800,
    width: 2400,
    height: 2500,
  },
  {
    id: nanoid(),
    name: '9.6米厢式货车',
    length: 9600,
    width: 2400,
    height: 2800,
  },
]

export const defaultCargoSpecs: SpecsType[] = [
  {
    id: nanoid(),
    name: '小型纸箱',
    netWeight: 5,
    grossWeight: 6,
    length: 300,
    width: 200,
    height: 100,
  },
  {
    id: nanoid(),
    name: '中型纸箱',
    netWeight: 10,
    grossWeight: 12,
    length: 600,
    width: 500,
    height: 400,
  },
  {
    id: nanoid(),
    name: '大型纸箱',
    netWeight: 20,
    grossWeight: 24,
    length: 900,
    width: 800,
    height: 700,
  },
]
