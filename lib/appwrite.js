import {
    Client,
    Account,
    ID,
    Avatars,
    Databases,
    Storage,
    Query
} from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    videoCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID,
    storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID,
};

// Init Your react-native SDK
const client = new Client();

client 
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

const account = new Account(client);
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

// Register User
export async function createUser(email, password, username) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username,
        );

        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username)

        await signin(email, password)

        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email: email,
                username: username,
                avatar: avatarUrl
            }
        );

        return newUser;

    } catch (error) {
        console.log("Appwrite serive :: createUser :: error", error);
        throw new Error(error);
    }
}

// Sign-in
export async function signin(email, password) {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        console.log("Appwrite serive :: signin :: error", error);
        throw new Error(error);
    }
}

// Get Account
export async function getAccount() {
    try {
        const currentAccount = await account.get()

        return currentAccount;
    } catch (error) {
        console.log("Appwrite serive :: getAccount :: error", error);
        throw new Error(error);
    }
}

// Get Current User
export async function getCurrentUser() {
    try {
        const currentAccount = await getAccount()

        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountId", currentAccount.$id)]
        );

        if(!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log("Appwrite serive :: getCurrentUser :: error", error);
        // return null;
    }
}

// Sign-out
export async function signout() {
    try {
        const session = await account.deleteSession("current")

        return session;
    } catch (error) {
        console.log("Appwrite serive :: signout :: error", error);
        throw new Error(error);
    }
}

// Upload Files
export async function uploadFile(file, type) {
    if(!file) return;

    const { mimeType, ...rest } = file;
    const asset = { type: mimeType, ...rest};

    // const asset = {
    //     name: file.fileName,
    //     type: file.mimeType,
    //     size: file.fileSize,
    //     uri: file.uri,
    // }

    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            asset,
        );

        const fileUrl = await getFilePreview(uploadedFile.$id, type);

        return fileUrl;

    } catch (error) {
        console.log("Appwrite serive :: uploadFile :: error", error);
        throw new Error(error);
    }

}

// Get File Previwe
export async function getFilePreview(fileId, type) {
    let fileUrl;

    try {
        if (type === "video") {
            fileUrl = storage.getFileView(
                appwriteConfig.storageId,
                fileId
            )
        } else if(type === "image"){
            fileUrl = storage.getFilePreview(
                appwriteConfig.storageId,
                fileId,
                2000,
                2000,
                "top",
                100
            );
        } else {
            throw new Error("Invalid File Type");
        }

        if(!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log("Appwrite serive :: getFilePreview :: error", error);
        throw new Error(error);
    }
}

// Create Video Post
export async function createVideoPost(form) {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, "video") // if the error come in this method then change the "video" to "videos"
        ]);

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            ID.unique(),
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                prompt: form.prompt,
                video: videoUrl,
                creator: form.userId,
            }
        );

        return newPost;

    } catch (error) {
        console.log("Appwrite serive :: createVideoPost :: error", error);
        throw new Error(error);
    }
}

// Get all Video Posts
export async function getAllPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc("$createdAt")]
        );

        return posts.documents;
    } catch (error) {
        console.log("Appwrite serive :: getAllPosts :: error", error);
        throw new Error(error);
    }
}

// Get Video post Created By Users
export async function getUserPosts(userId) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
        );

        return posts.documents;

    } catch (error) {
        console.log("Appwrite serive :: getUserPosts :: error", error);
        throw new Error(error);
    }
}

// Get Video posts that matches search Query
export async function searchPosts(query) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.search["title", query]]
        );

        if(!posts) throw Error("Something Went Wrong in the Search Query");

        return posts.documents;
    } catch (error) {
        console.log("Appwrite serive :: searchPosts :: error", error);
        throw new Error(error);
    }
}

// Get latest created Video Posts
export async function getLatestPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.videoCollectionId,
            [Query.orderDesc("$createdAt"), Query.limit(7)]
        );

        return posts.documents;
    } catch (error) {
        console.log("Appwrite serive :: getLatestPosts :: error", error);
        throw new Error(error);
    }
}
