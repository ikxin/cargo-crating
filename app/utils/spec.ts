import { nanoid } from 'nanoid'

export const defaultTruckSpecs: SpecsType[] = [
  {
    uuid: nanoid(),
    name: '4.2米厢式货车',
    length: 4200,
    width: 2100,
    height: 2000,
  },
  {
    uuid: nanoid(),
    name: '6.8米厢式货车',
    length: 6800,
    width: 2400,
    height: 2500,
  },
  {
    uuid: nanoid(),
    name: '9.6米厢式货车',
    length: 9600,
    width: 2400,
    height: 2800,
  },
  {
    uuid: nanoid(),
    name: '13米厢式货车',
    length: 13000,
    width: 2400,
    height: 2800,
  },
]

export const defaultCargoSpecs: SpecsType[] = [
  {
    uuid: nanoid(),
    name: '小型纸箱',
    length: 300,
    width: 200,
    height: 200,
  },
  {
    uuid: nanoid(),
    name: '中型纸箱',
    length: 400,
    width: 300,
    height: 300,
  },
  {
    uuid: nanoid(),
    name: '大型纸箱',
    length: 600,
    width: 400,
    height: 400,
  },
  {
    uuid: nanoid(),
    name: '特大型纸箱',
    length: 800,
    width: 600,
    height: 600,
  },
]
