import pandas as pd
import datetime
import json
import requests
import shutil
import dateutil.parser
import os
from Crypto.Cipher import XOR
import base64

# API functions

class FetchAPIData:
    __base_api = 'https://asia-east2-eudaemon-20a5e.cloudfunctions.net/api'

    def __init__(self, cci_id):
        self.get_children_data(cci_id)
        # self.get_pix()
        # self.set_attendance_template()

    def get_children_data(self, cci_id):
        __api_endpoint = '/attendance/children?cci=' + cci_id
        response = requests.get(self.__base_api + __api_endpoint)
        response_json = response.json()
        df = pd.DataFrame(response_json['result'])
        df.to_csv('./data/assets/cache/student_data.csv')

    def get_pix(self):
        df = pd.read_csv('./data/assets/cache/student_data.csv')
        for url in df['photo']:
            filename = df.loc[df['photo'] == url, 'id'].to_string().split()[-1]
        
            with open('./static/assets/'+ filename + '.jpg', 'wb') as pic:
                response = requests.get(url, stream=True)
                if response.status_code == 200:
                    response.raw.decode_content = True
                    shutil.copyfileobj(response.raw, pic)
                    # print(filename)
                else:
                    raise ValueError('Couldn\'t Establish secure connection')
            
    def set_attendance_template(self):
        df = pd.read_csv('./data/assets/cache/student_data.csv')
        attendance_df = df[['name', 'age', 'id']]
        attendance_df = attendance_df.assign(image='./static/assets/' + df['name'] + '.jpg')
        attendance_df.to_csv('./data/bin/attendance_template.csv')


# attendance and process functions

class Attendance:

    __base_api = 'https://asia-east2-eudaemon-20a5e.cloudfunctions.net/api'
    __sent = False
    with open('./data/assets/cache/cci_secret.dat', 'rb') as f:
            __cci_id = f.read().decode('iso-8859-1') 


    def __init__(self):
        pass

    @staticmethod    
    def load_records():
        records = pd.read_csv('./data/bin/attendance_template.csv', index_col=0)
        # print(records.to_dict())
        return records.to_dict()

    @staticmethod
    def displayPresent(uids):
        assert uids != None
        records = pd.read_csv('./data/bin/attendance_template.csv', index_col=0)
        # print(records.loc[records['id'].isin(uids)].reset_index().to_dict())
        return records.loc[records['id'].isin(uids)].reset_index().to_dict()

    @staticmethod
    def assignAttendance(uids):
        records = pd.read_csv('./data/bin/attendance_template.csv')
        # print('here')
        records = records.drop(labels=['age', 'image'], axis=1)
        records = records.assign(attendance=["n"] * len(records["id"])) 
        records.loc[records['id'].isin(uids), 'attendance'] = ["y"] * len(records.loc[records['id'].isin(uids)]['attendance'])
        records.loc[records['id'].isin(uids), 'timestamp'] = [datetime.datetime.now().replace(microsecond=0).isoformat().encode('iso-8859-1')] * len(records.loc[records['id'].isin(uids)]['attendance'])
        attendance_json = {}
        attendance_json["attendance"] = json.loads(records[["attendance", "id", "name", "timestamp"]].to_json(orient='records'))
        attendance_json["cci"] = Attendance.__cci_id        
        attendance_json["date"] = datetime.datetime.now().replace(microsecond=0).isoformat()
        filename = dateutil.parser.isoparse(attendance_json["date"]).date().strftime('%d-%m-%Y')
        result_json = json.dumps(attendance_json, indent=4,  sort_keys=True)

        # print(attendance_json["attendance"][:]["id"])
        if Attendance.__sent:
                # print(Attendance.__sent)
                fileList = [f for f in os.listdir('./data/attendance/') if f.endswith('.json')]
                for f in fileList:
                    os.remove(os.path.join('./data/attendance/', f))

        try:
            # print('here1')
            with open('./data/attendance/' + filename + '.json') as f:
                existing_json = json.loads(f.read())
                for x in existing_json["attendance"]:
                    if x["attendance"] == "n":
                        existing_json["attendance"].remove(existing_json["attendance"][existing_json["attendance"].index(x)])
                    for i in attendance_json["attendance"]:    
                        if x["attendance"] == "y" and x["id"] == i["id"]:
                            existing_json["attendance"].remove(existing_json["attendance"][existing_json["attendance"].index(x)])
                existing_json["attendance"].extend(attendance_json["attendance"])
                existing_json = json.dumps(existing_json, indent=4, sort_keys=True)
            
            with open('./data/attendance/' + filename + '.json', 'w') as f:
                f.write(existing_json)
        
        except FileNotFoundError:
            # print('here2')
            with open('./data/attendance/' + filename + '.json', 'w') as f:
                # print(result_json)
                f.write(result_json)

        finally:
            # print('finally')
            if Attendance.check_internet_connection():
                # print('here3')
                Attendance.postAttendance()
                Attendance.__sent = True
            else:
                Attendance.__sent = False

    
    @staticmethod 
    def visitJson(args):
        # student_data = {'bio': 'SomeDictHere', 'visitData' : args}
        df = pd.read_csv('./data/assets/cache/student_data.csv')
        # print(args['startTime'])
        
        args['startTime'] = datetime.datetime.strptime(args['date'] + ' ' + args['startTime'],"%Y-%m-%d %H:%M").isoformat()
        args['stopTime'] = datetime.datetime.strptime(args['date'] + ' ' + args['stopTime'],"%Y-%m-%d %H:%M").isoformat()
        args['date'] = datetime.datetime.strptime(args['date'],"%Y-%m-%d").isoformat()
        args['childId'] = df.loc[df['guardian'] == args['guardianId'], 'id'].to_dict()[0]
        args["cci"] = Attendance.__cci_id
        # print(args)
        visit_json = json.dumps(args, indent=4, sort_keys=True)
        with open(r'./data/visit.json', 'w') as f:
            f.write(visit_json)
        Attendance.postVisitScheduled()

    @staticmethod
    def retainScheduledVisits():
        if Attendance.check_internet_connection():
            __api_endpoint = '/attendance/guardians?cci=' + Attendance.__cci_id
            # print(Attendance.__base_api + __api_endpoint)
            response = requests.get(Attendance.__base_api + __api_endpoint)
            # print(response.text)
            upcomingVisitsJson = response.json()
            df = pd.DataFrame(upcomingVisitsJson['data'])
            df.to_csv('./data/bin/UpcomingVisits.csv')
    
    @staticmethod
    def getScheduledVisits():
        df = pd.read_csv('./data/bin/UpcomingVisits.csv')
        df1 = pd.read_csv('./data/bin/attendance_template.csv')
        df1 = df1.rename(columns={'id' : 'childId'})
        df = pd.merge(df, df1, on='childId')
        student_dict = df.to_dict()

        # print(student_dict)

        for i in range(len(student_dict['date'])):
            student_dict['date'][i] = dateutil.parser.isoparse(student_dict['date'][i]).strftime('%d-%m-%Y')
            student_dict['startTime'][i] = dateutil.parser.isoparse(student_dict['startTime'][i]).strftime('%H:%M')
            student_dict['stopTime'][i] = dateutil.parser.isoparse(student_dict['stopTime'][i]).strftime('%H:%M')
            # print(student_dict['date'], student_dict['startTime'], student_dict['stopTime'])
        # df = df.assign(name=df1.loc[df1['id'] == df['childId'], 'name'])
        
        return student_dict
            

    @staticmethod
    def check_internet_connection():
        try:
            requests.get('https://www.google.com')
            return True
        except requests.ConnectionError:
            return False

    @staticmethod
    def postAttendance():
        # print('postAttendance')
        fileList = [f for f in os.listdir('./data/attendance/') if f.endswith('.json')]
        for f in fileList:
            with open(os.path.join('./data/attendance/', f)) as fi:
                myObj = json.loads(fi.read())
                response = requests.post(Attendance.__base_api + '/attendance/children', json=myObj)
            print(response.json() , response.status_code)
    
    @staticmethod
    def postVisitScheduled():
        with open(r'./data/visit.json') as f:
            myObj = json.loads(f.read())
            response = requests.post(Attendance.__base_api + '/attendance/guardians', json=myObj)

        print(response.json(), response.status_code)
        

def encrypt(key, plaintext):
    cipher = XOR.new(key)
    return base64.b64encode(cipher.encrypt(plaintext))

def decrypt(key, ciphertext):
    cipher = XOR.new(key)
    return base64.b64decode(cipher.decrypt(ciphertext))