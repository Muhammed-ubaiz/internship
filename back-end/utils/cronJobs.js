
import cron from 'node-cron';
import Attendance from '../Model/Attendancemodel.js';

export const startCronJobs = (io) => {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log('⏰ Running auto punch-out cron job...');

        try {
            // 1. Calculate time threshold (10 hours ago)
            const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);

            // 2. Find students who are still punched in AND punchIn time is older than 10 hours
            // We look for documents where the LAST element of punchRecords has no punchOut
            const stuckAttendances = await Attendance.find({
                "punchRecords.punchOut": null, // At least one record is open (though logic below refines this)
            });

            for (const attendance of stuckAttendances) {
                let isModified = false;

                // Iterate through punch records to find the open one
                for (const record of attendance.punchRecords) {
                    if (!record.punchOut && new Date(record.punchIn) <= tenHoursAgo) {

                        // Found a punch that exceeded 10 hours
                        const punchInTime = new Date(record.punchIn);
                        const autoPunchOutTime = new Date(punchInTime.getTime() + 10 * 60 * 60 * 1000); // Set partially to exact 10h mark

                        record.punchOut = autoPunchOutTime;
                        record.autoPunchOut = true;
                        record.autoPunchOutReason = "System Timeout (10hr limit)";

                        // Calculate session seconds (should be exactly 10 hours = 36000 seconds)
                        const sessionSeconds = 10 * 60 * 60;
                        record.sessionWorkingSeconds = sessionSeconds;

                        // Update total working seconds
                        attendance.totalWorkingSeconds += sessionSeconds;

                        // Update current break status (since they are now "punched out", they are technically on break/off)
                        attendance.currentBreakStart = autoPunchOutTime;
                        attendance.isCurrentlyOnBreak = true;

                        isModified = true;

                        console.log(`⚠️ Auto punch-out triggered for Student: ${attendance.studentId}`);

                        // Emit socket event to notify the student if they are online
                        if (io) {
                            // We emit to the specific student room
                            io.to(attendance.studentId.toString()).emit('autoPunchOut', {
                                message: "You have been automatically punched out after 10 hours.",
                                punchOutTime: autoPunchOutTime,
                                distance: attendance.initialDistance || 0 // sending last known distance if available
                            });
                        }
                    }
                }

                if (isModified) {
                    await attendance.save();
                }
            }

        } catch (error) {
            console.error('❌ Error in auto punch-out cron job:', error);
        }
    });
};
