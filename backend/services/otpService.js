const reportOtpStore = new Map()

// Time-to-live for OTP: 5 minutes
const OTP_TTL_MS = 5 * 60 * 1000

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Issue a new OTP for report submission
 * @param {string} userId - The user's ID
 * @param {string} inspectionId - The inspection ID
 * @returns {string} The generated OTP
 */
const issueReportOtp = (userId, inspectionId) => {
  const key = `${String(userId)}:${String(inspectionId)}`
  const otp = generateOTP()

  reportOtpStore.set(key, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
    createdAt: new Date(),
  })

  // TODO: In production, send OTP via email/SMS
  // await sendOTPViaSMS(user.phone, otp)
  // await sendOTPViaEmail(user.email, otp)

  console.log(`[DEV] OTP Generated for ${userId}: ${otp} (expires in 5 minutes)`)

  return otp
}

/**
 * Verify the OTP for report submission
 * @param {string} userId - The user's ID
 * @param {string} inspectionId - The inspection ID
 * @param {string} otp - The OTP provided by the user
 * @returns {object} {ok: boolean, message: string}
 */
const verifyReportOtp = (userId, inspectionId, otp) => {
  const key = `${String(userId)}:${String(inspectionId)}`
  const record = reportOtpStore.get(key)

  if (!record) {
    return { ok: false, message: 'OTP not requested. Please request OTP first.' }
  }

  // Check expiration
  if (Date.now() > record.expiresAt) {
    reportOtpStore.delete(key)
    return { ok: false, message: 'OTP has expired. Please request a new OTP.' }
  }

  // Verify OTP value
  if (String(otp).trim() !== record.otp) {
    return { ok: false, message: 'Invalid OTP. Please try again.' }
  }

  // OTP is valid - delete it so it can't be reused
  reportOtpStore.delete(key)

  return {
    ok: true,
    message: 'OTP verified successfully',
    verifiedAt: new Date(),
  }
}

/**
 * Clear expired OTPs (cleanup function)
 * Can be called periodically to prevent memory leaks
 */
const clearExpiredOTPs = () => {
  const now = Date.now()
  let cleared = 0

  for (const [key, record] of reportOtpStore.entries()) {
    if (now > record.expiresAt) {
      reportOtpStore.delete(key)
      cleared++
    }
  }

  if (cleared > 0) {
    console.log(`[OTP Service] Cleared ${cleared} expired OTPs`)
  }
}

// Run cleanup every 5 minutes
setInterval(clearExpiredOTPs, 5 * 60 * 1000)

module.exports = {
  generateOTP,
  issueReportOtp,
  verifyReportOtp,
  clearExpiredOTPs,
}
