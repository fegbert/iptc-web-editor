export default function (date: string | number | Date, formatString: string = 'DD MMM YYYY, HH:mm') {
  return useDateFormat(date, formatString)
}
