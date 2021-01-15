import os
from dotenv import load_dotenv
import tweepy
import schedule
import time

load_dotenv()

GIVEAWAY_FILE_NAME = 'giveaway.dat'

auth = tweepy.OAuthHandler(os.getenv('API_KEY'), os.getenv('API_KEY_SECRET'))
auth.set_access_token(os.getenv('ACCESS_TOKEN'), os.getenv('ACCESS_TOKEN_SECRET'))

api = tweepy.API(auth)

# api.update_status('@JoujMon wesh bg')

# jouj = api.get_user('JoujMon')

# api.send_direct_message(jouj.id, "imagine being roux")

def job():
    print("I'm working...")

def read_last_giveaway(FILE_NAME):
    file_read = open(FILE_NAME, 'r')
    giveaway_id = int(file_read.read().strip())
    file_read.close()
    return giveaway_id

def store_last_giveaway(FILE_NAME, last_giveaway_id):
    file_write = open(FILE_NAME, 'w')
    file_write.write(str(last_giveaway_id))
    file_write.close()
    return

def start_giveaway():
    status = api.update_status('Giveaway...')
    print(status)
    return

def end_giveaway():

    return

def fetch_giveaway_users():
    giveaway_id = read_last_giveaway(GIVEAWAY_FILE_NAME)
    retweeters = [status.user.id for status in api.retweets(giveaway_id)]
    print(retweeters)
    return

fetch_giveaway_users()
schedule.every().day.at('15:55').do(start_giveaway)
schedule.every(5).seconds.do(fetch_giveaway_users)
schedule.every().day.at('16:00').do(end_giveaway)

# schedule.every().hour.do(fetch_giveaway_users)

# start_giveaway()

# while 1:
#     schedule.run_pending()
#     time.sleep(1)