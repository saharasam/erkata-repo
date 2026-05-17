allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    project.plugins.withId("com.android.library") {
        if (project.name == "flutter_jailbreak_detection") {
            val android = project.extensions.findByName("android")
            if (android != null) {
                try {
                    android.javaClass.getMethod("setNamespace", String::class.java)
                        .invoke(android, "appmire.be.flutterjailbreakdetection")
                } catch (e: Exception) {
                    // Ignore
                }
            }
        }

        val androidExt = project.extensions.findByName("android")
        if (androidExt is com.android.build.gradle.BaseExtension) {
            // Force NDK configuration for all subprojects to ensure Clang discovery
            androidExt.ndkVersion = "27.0.12077973"
            androidExt.ndkPath = "C:\\Users\\samue\\AppData\\Local\\Android\\sdk\\ndk\\27.0.12077973"
        }

        project.afterEvaluate {
            val evaluatedAndroid = project.extensions.findByName("android") as? com.android.build.gradle.BaseExtension
            if (evaluatedAndroid != null) {
                val targetCompat = evaluatedAndroid.compileOptions.targetCompatibility.toString()
                project.tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
                    compilerOptions {
                        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.fromTarget(targetCompat))
                    }
                }
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
