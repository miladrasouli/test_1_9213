export const money = (value: number | null | undefined) => `${new Intl.NumberFormat('fa-IR').format(value ?? 0)} تومان`;
