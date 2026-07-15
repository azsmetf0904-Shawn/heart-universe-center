const startRental = '開始申請租借'
const queryStatus = '查詢申請狀態'
const applyRental = '申請租借'
const applyRentalNow = '立即申請租借'
const applyFromAvailability = '前往申請租借'

const register = '立即報名'
const review = '查看回顧'
const freeRegister = '免費報名'
const confirmRegister = '確認報名'

const nextAddons = '前往加購'
const nextConfirm = '前往確認'
const back = '返回上一步'
const submit = '送出申請'
const submitting = '送出中…'
const loginLineThenSubmit = '登入 LINE 後送出'
const loginLine = 'LINE 登入'
const retry = '重新嘗試'
const retryLine = '重新登入 LINE'
const noticeConnected = '通知接收：LINE 已連結'
const noticeRequired = '通知接收：需登入 LINE'
const joinOfficialLine = '+ 加入官方 LINE'
const searching = '查詢中…'
const checkIn = '完成簽到'
const checkInSuccess = '簽到成功！'
const alreadyCheckedIn = '已完成簽到'

export const CTA = {
  home: {
    startRental,
    viewVenuePhotos: '查看場地照片',
    viewAllEvents: '查看所有活動',
    viewAll: '查看全部',
    viewAlbum: '查看相簿',
  },
  nav: {
    startRental,
    queryStatus,
  },
  booking: {
    applyRental,
    queryStatus,
    query: '查詢',
    searching,
  },
  rental: {
    nextAddons,
    nextConfirm,
    back,
    submit,
    submitting,
    loginLineThenSubmit,
    loginLine,
    retry,
    retryLine,
    noticeConnected,
    noticeRequired,
    queryStatus,
    joinOfficialLine,
  },
  events: {
    register,
    confirmRegister,
    review,
    freeRegister,
    checkIn,
    checkInSuccess,
    alreadyCheckedIn,
  },
  system: {
    searching,
    checkIn,
    checkInSuccess,
    alreadyCheckedIn,
  },
  venue: {
    applyRental,
    applyRentalNow,
    applyFromAvailability,
  },
  community: {
    cooperation: '了解場地合作方案',
  },
} as const
