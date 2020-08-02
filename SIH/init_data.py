from data.lib.programUtils import FetchAPIData

with open('./data/assets/cache/cci_secret.dat', 'rb') as f:
    cci_secret = f.read().decode('iso-8859-1')

FetchAPIData(cci_secret)