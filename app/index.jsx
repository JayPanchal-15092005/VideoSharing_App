import { Image, Text, View, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import "../global.css";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import { CustomButton, Loader } from "../components/index";
import { Redirect, router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider.js"

const Welcome = () => {

  const { loading, isLogged} = useGlobalContext();

  // if (!loading && isLogged) return <Redirect href="/home" />;

  if (loading) {
    return (
      <SafeAreaView className="bg-primary h-full justify-center items-center">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }
  
  if (isLogged) {
    return <Redirect href="/home" />;
  }

  //
  if (!loading && !isLogged) {
    return (
      <SafeAreaView>
        <Text>Something went wrong or context not ready</Text>
      </SafeAreaView>
    );
  }
  ////

  return (
    <SafeAreaView className="bg-primary h-full">
      <Loader isLoading={loading} />

      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View className="w-full flex justify-center items-center h-full px-4">
          {/* please in the upper style you have h-full style please use this style -> min-h-[85vh] insted of this h-full */}
          <Image
            source={images.logo}
            className="w-[130px] h-[84px]"
            resizeMode="contain"
          />

          <Image
            source={images.cards}
            className="max-w-[380px] w-full h-[298px]"
            resizeMode="contain"
          />

          <View className="relative mt-5">
            <Text className="text-3xl text-white font-bold text-center">
              Discover Endless{"\n"}
              Possibilities with{" "}
              <Text className="text-secondary-200">Aora</Text>
            </Text>

            <Image
              source={images.path}
              className="w-[136px] h-[15px] absolute -bottom-2 -right-8"
              resizeMode="contain"
            />
          </View>

          <Text className="text-sm font-pregular text-gray-100 mt-7 text-center">
            Where Creativity Meets Innovation: Embark on a Journey of Limitless
            Exploration with Aora
          </Text>

          <CustomButton
            title="Continue with Email"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="dark" />
    </SafeAreaView>
  );
}

export default Welcome;