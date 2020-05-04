import React from 'react';
import { Text,
View, 
TouchableOpacity, 
StyleSheet,
Image,
Alert,
ToastAndroid,
KeyboardAvoidingView
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import db from '../config.js';
import { TextInput } from 'react-native-gesture-handler';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedData: '',
        buttonState: 'normal',
        scannedBookId : '',
        scannedStudentId : ''
      }
    }

    getCameraPermissions = async () =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: 'clicked',
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      this.setState({
        scanned: true,
        scannedData: data,
        buttonState: 'normal'
      });
    }
    /* abstract functions (when we don't complete the function but we know that 
     we will use it later) */
    checkBookEligibility = async() =>{

    }
    
checkStudentEligibilityForIssue = async() => {
const studentRef  = await db.collection("StudentCollection").where("StudentId",
"===", this.state.scannedStudentId)
var isStudentEligible = ""
if(studentRef.docs.length == 0) {
this.setState({
  scannedStudentId : '',
  scannedBookId : ''
})
isStudentEligible = false;
Alert.alert ("The student id doesnot exist in the database ! :-(")
}
else {
  studentRef.docs.map((doc)=>{
    var student = doc.data();
  if(student.NoOfBooksIssued < 2){
    isStudentEligible = true;
  }
  else{
    isStudentEligible = false;
    Alert.alert ("The student is not eligible for issuing the books. :-(")
    this.setState({
      scannedStudentId : '',
      scannedBookId : ''
    })
  }
  })  
}
return isStudentEligible
}

checkStudentEligibilityForReturn = async() => {
const transactionRef = await db.collection("Transaction").where("BookId","===",
this.state.scannedBookId ).limit(1).get()

var isStudentEligible = ""
transactionRef.docs.map((doc) =>{
var lastBookTransaction = doc.data();
if(lastBookTransaction.studentId === this.state.scannedStudentId){
  isStudentEligible = true;
}
else {
  isStudentEligible = false;
  Alert.alert = ("The student ids donot match. :-(")
  this.setState({
    scannedStudentId : '',
    scannedBookId : ''
  })
}
})
return isStudentEligible
}

initiateBookIssue = async () => {
db.collection ("Transaction").add({
  StudentId : this.state.scannedStudentId,
  BookId : this.state.scannedBookId,
  date : firebase.firestore.Timestamp.now().toDate(), 
  transactionType : "Issue"
})
db.collection ("Books").doc(this.state.scannedBookId).update({
  BookAvailability : false
})
db.collection ("StudentCollection").doc(this.state.scannedStudentId).update({
  NoOfBooksIssued : firebase.firestore.FieldValue.increment(1)
})
this.setState({
  scannedStudentId : '',
  scannedBookId : ''
})

}

initiateBookReturn = async () => {
  db.collection ("Transaction").add({
    StudentId : this.state.scannedStudentId,
    BookId : this.state.scannedBookId,
    date : firebase.firestore.Timestamp.now().toDate(), 
    transactionType : "Return"
  })
  db.collection ("Books").doc(this.state.scannedBookId).update({
    BookAvailability : true
  })
  db.collection ("StudentCollection").doc(this.state.scannedStudentId).update({
    NoOfBooksIssued : firebase.firestore.FieldValue.increment(-1)
  })
  this.setState({
    scannedStudentId : '',
    scannedBookId : ''
  })
}

handleTransactions = async () => {
  var transactionType = await this.checkBookEligibility()
  if (!transactionType) {
    Alert.alert ("The book with the given name is not in the database!!")
    this.setState({
      scannedStudentId : '', scannedBookId : ''
    })
  }
  else if(transactionType === "Issue") {
  var isStudentEligible = await this.checkStudentEligibilityForIssue()
  if(isStudentEligible) {
   this.initiateBookIssue()
   Alert.alert("Book issued !! :-)")
  }
  }
  else {
    var isStudentEligible = await this.checkStudentEligibilityForReturn()
    if(isStudentEligible) {
     this.initiateBookReturn()
     Alert.alert("Book returned to the library !! :-)")
    }
  }
}

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
          // ? and : are ternary operators. If the 
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView  behaviour = "padding" style={styles.container}>
<View>
<Image source = {require("../Images/booklogo.jpg")}
style = {{width : 100, height : 100}}
/>
</View>
          <TextInput style={styles.inputText}>{
hasCameraPermissions===true ? this.state.scannedData: "Request Camera Permission"
          }</Text>     

          <TouchableOpacity
            onPress={this.getCameraPermissions}
            style={styles.scanButton}>
            <Text style={styles.buttonText}>Scan QR Code</Text>
          </TouchableOpacity>
          
        </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 20,
    }
  });