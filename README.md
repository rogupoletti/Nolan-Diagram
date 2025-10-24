# Political Compass Quiz - Admin Setup

This guide explains how to set up your first administrative user to access the admin panel located at the `/admin` route.

The admin panel allows you to manage quiz questions and view user submissions. Access is restricted to authenticated users who are explicitly designated as administrators in the Firestore database.

## Prerequisites

- You have successfully created a Firebase project and configured it in `services/firebase.ts`.
- You have enabled **Email/Password** sign-in in the Firebase console.

## Steps to Create an Admin User

### 1. Enable Email/Password Authentication

1.  Go to your [Firebase Console](https://console.firebase.google.com/).
2.  Navigate to **Authentication** from the left-hand menu.
3.  Click on the **Sign-in method** tab.
4.  Find **Email/Password** in the list, click the pencil icon to edit it, and **Enable** it.
5.  Click **Save**.

### 2. Create the User Account

1.  In the **Authentication** section, go to the **Users** tab.
2.  Click the **Add user** button.
3.  Enter the email address and a secure password for your admin account.
4.  Click **Add user**.
5.  After the user is created, find them in the user list and **copy their User UID**. You will need this for the next step.

### 3. Grant Admin Privileges in Firestore

1.  In the Firebase Console, navigate to **Firestore Database** from the left-hand menu.
2.  Create a new collection by clicking **+ Start collection**.
3.  Set the **Collection ID** to `admins`. **Important:** This name must be exact.
4.  Click **Next**.
5.  For the **Document ID**, **paste the User UID** you copied from the Authentication step.
6.  You can add a field to the document, but it's not strictly required by the current app logic. For example:
    - Field: `isAdmin`
    - Type: `boolean`
    - Value: `true`
7.  Click **Save**.

That's it! Your admin user is now set up. You can navigate to `/admin` in your application and log in using the email and password you created.
