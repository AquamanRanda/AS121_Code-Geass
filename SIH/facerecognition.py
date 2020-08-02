import cv2
import numpy as np
import face_recognition
import os
import pandas as pd
from datetime import datetime
from data.lib.programUtils import Attendance

# cap = cv2.VideoCapture(0)

class FaceRecognition:
    cap = None

    @staticmethod
    def findEncodings(images):
        encodeList = []
        for img in images:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            encode = face_recognition.face_encodings(img)[0]
            encodeList.append(encode)
        return encodeList

    @staticmethod
    def markAttendance(name):
        # print("write")
        with open('./data/bin/Attendance.csv', 'r+') as f:
            myDataList = f.readlines()
            nameList = []
            for line in myDataList:
                entry = line.split(',')
                nameList.append(entry[0])
            if name not in nameList:
                now = datetime.now()
                Monthstr = now.strftime('%D')
                dtString = now.isoformat()
                f.writelines(f'\n{name},{dtString}')
                attende = name + '' + dtString
                print(Monthstr)


    @staticmethod
    def init_video_record():
        idList = []
        FaceRecognition.cap = cv2.VideoCapture(0)
        path = './static/assets'
        images = []
        classNames = []
        myList = os.listdir(path)
        print(myList)
        

        for cl in myList:
            curImg = cv2.imread(f'{path}/{cl}')
            images.append(curImg)
            classNames.append(os.path.splitext(cl)[0])
        print(classNames)

        encodeListKnown = FaceRecognition.findEncodings(images)
        print('Encoding Complete')

        # cap = cv2.VideoCapture(0)

        while FaceRecognition.cap.isOpened():
            success, img = FaceRecognition.cap.read()
            # img = captureScreen()
            imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
            imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)

            

            facesCurFrame = face_recognition.face_locations(imgS)
            encodesCurFrame = face_recognition.face_encodings(imgS, facesCurFrame)

            for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
                matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
                faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
                # print(faceDis)
                matchIndex = np.argmin(faceDis)

                if matches[matchIndex]:
                    name = classNames[matchIndex]
                    # print(name)
                    y1, x2, y2, x1 = faceLoc
                    y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.rectangle(img, (x1, y2 - 35), (x2, y2), (0, 255, 0), cv2.FILLED)
                    cv2.putText(img, name, (x1 + 6, y2 - 6), cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 2)
                    idList.append(name)
                    FaceRecognition.markAttendance(name)
                    
            cv2.imshow('Webcam', img)
            ch=cv2.waitKey(1)
            if ch== 27 or ch== ord("Q") or ch== ord("q"):
                Attendance.assignAttendance(list(set(idList)))
                FaceRecognition.close_recording()

    @staticmethod
    def close_recording():
        FaceRecognition.cap.release()
        print(FaceRecognition.cap)
        cv2.destroyAllWindows()