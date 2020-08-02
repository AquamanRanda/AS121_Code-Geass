from flask import Flask, render_template, request, redirect, url_for, flash
import os

from data.lib.programUtils import Attendance, FetchAPIData
# load_records, assignAttendance, displayPresent, visitJson, postAttendance
from facerecognition import FaceRecognition

app = Flask(__name__)

# fr = FaceRecognition()

# <--- Main --->
att_list = []
BOOL = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/start-attendance')
def init_start_attendance():
    global BOOL
    if BOOL == True:
        message = 'Face Recognition is already running'
    else:
        BOOL = True
        FaceRecognition.init_video_record()
        message = 'Face Recognition has started'
    
    flash(message)
    return redirect(url_for('index'))

@app.route('/stop-attendance')
def init_stop_attendance():
    global BOOL
    if BOOL == False:
        message = 'Face Recognition is not running'
    else:
        BOOL = False
        FaceRecognition.close_recording()
        message = 'Face Recognition was stopped'
    
    flash(message)
    return redirect(url_for('index'))


@app.route('/edit-attendance/', methods=['GET', 'POST'])
def init_edit_attendance():
    # print(name)
    student_record = Attendance.load_records()
    # print(student_record)
    return render_template('editAttendance.html', student_record=student_record, len=len(student_record['name']))

@app.route('/edit-attendance/submit', methods=['GET', 'POST'])
def submit_attendance():
    global att_list
    att_list = request.args.getlist('attendance')
    records = Attendance.displayPresent(att_list)
    Attendance.assignAttendance(att_list)
    # returnJson('students.csv', att_list)
    return render_template('attendance.html', student_record=records, len=len(records['name']))

@app.route('/schedule-visit/', methods=['GET', 'POST'])
def init_schedule_visit():
    return render_template('visitForm.html')

@app.route('/schedule-visit/confirm', methods=['GET', 'POST'])
def schedule_visit():
    args = request.args.to_dict()
    Attendance.visitJson(args)
    flash('Visit Scheduled')
    return redirect(url_for('index'))

@app.route('/scheduled-visits')
def display_scheduled_visits():
    Attendance.retainScheduledVisits()
    records = Attendance.getScheduledVisits()
    return render_template('upcomingVisits.html', student_record=records, len=len(records['cci']))


def main():
    app.secret_key = os.urandom(24)
    app.run(threaded=True, port=5000, debug=True)

if __name__ == "__main__":
    main()