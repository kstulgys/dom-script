// Avoid exposing variables to global scope
(function () {
  /**
   * Local scope variables
   **/

  const pageListToTrackOnLoad = ["checkout", "order"];
  const currentPage = window.location.href;

  const fieldsOfInterest = [
    "reference",
    "refno",
    "order",
    "ordernumber",
    "orderno",
    "lastname",
    "firstname",
    "email",
    "billing_email",
  ];

  // search in localStorage
  // search in sessionStorage
  // search in DOM
  // search in global objects
  // search in cookies

  // Collect data on page load
  //   document.addEventListener("load", () => {
  //     if (Utils.shouldCollectData()) {
  //       Data.init(currentPage);
  //       Data.collectGlobalData();
  //     }
  //   });

  // Collect data beforeunload and send to server
  document.addEventListener("beforeunload", () => {
    if (Utils.shouldCollectData()) {
      //   const data = Data.init(currentPage);
      //   let emailContainingElements = document.querySelectorAll(
      //     '[name="email"], [name="billing_email"], .email, #email'
      //   );
      //   emailContainingElements.forEach((el) => {
      //     data.unloadEmails.push(el.value);
      //   });
      Data.searchDataInLocalStorage();
      Data.searchDataInSessionStorage();
      Data.searchDataInDOM();
      Data.searchDataInGlobalScope();
      Data.sendDataToServer();
    }
  });

  /**
   * Data Module
   **/

  const Data = (function () {
    let _data = {};

    function init(url, id) {
      const invitationData = getDataFromStorage() || {};
      _data = {
        url,
        id,
        unloadEmails: [],
        elements: [],
        globals: [],
        sessionId: getOrCreateGTMSessionId(),
        localId: getOrCreateGTMLocalId(),
        ...invitationData,
      };
      _writeDataToStorage();
      return _data;
    }

    function pushElements(newElements) {
      for (var i = 0; i < newElements.length; i++) {
        var element = newElements[i];
        var key = `${element.id}-${element.name}`;
        _data.elements.set(key, element);
      }
      _writeDataToStorage();
    }

    function pushGlobals(newGlobals) {
      for (var i = 0; i < newGlobals.length; i++) {
        var global = newGlobals[i];
        var key = `${global.name}`;
        _data.globals.set(key, global);
      }
      _writeDataToStorage();
    }

    function pushUnloadEmails(unloadEmails) {
      _data.unloadEmails = _data.unloadEmails.concat(unloadEmails);
      _writeDataToStorage();
    }

    function collectGlobalData() {
      // collect data from window object global variables
      _writeDataToStorage();
    }

    function sendDataToServer() {
      const invitationData = getDataFromStorage();
      if (invitationData) {
        navigator.sendBeacon("/log", JSON.stringify(invitationData));
      }
    }

    function getDataFromStorage() {
      const invitationData = localStorage.getItem("tpInvitationData");
      if (invitationData) {
        return JSON.parse(invitationData);
      }
      return null;
    }

    function getOrCreateGTMSessionId() {
      let GTMSessionId = sessionStorage.getItem("TrustpilotGTMSessionId");
      if (GTMSessionId) {
        return GTMSessionId;
      } else {
        GTMSessionId = Utils.gnerateSessionId();
        sessionStorage.setItem("TrustpilotGTMSessionId", GTMSessionId);
        return GTMSessionId;
      }
    }

    function getOrCreateGTMLocalId() {
      let GTMLocalId = localStorage.getItem("TrustpilotGTMLocalId");
      if (GTMLocalId) {
        return GTMLocalId;
      } else {
        GTMLocalId = Utils.gnerateSessionId();
        localStorage.setItem("TrustpilotGTMLocalId", GTMLocalId);
        return GTMLocalId;
      }
    }

    function _writeDataToStorage() {
      localStorage.setItem("tpInvitationData", JSON.stringify(_data));
      return _data;
    }

    return {
      init,
      pushElements,
      pushGlobals,
      pushUnloadEmails,
      sendDataToServer,
    };
  })();

  /**
   * Utility Methods Module
   **/

  const Utils = (function () {
    function gnerateSessionId() {
      return "_" + Math.random().toString(36).substr(2, 9);
    }

    function shouldSearchData() {
      const GTMLocalId = localStorage.getItem("TrustpilotGTMLocalId");
      const GTMSessionId = sessionStorage.getItem("TrustpilotGTMSessionId");
      const TPInvitationData = Data.getDataFromStorage();
      return GTMLocalId && GTMSessionId && !TPInvitationData;
    }

    function isObject(value) {
      return (
        typeof value === "object" && !Array.isArray(value) && value !== null
      );
    }

    function isEmptyObject(value) {
      return Utils.isObject(value) && Object.keys(value).length > 0;
    }

    function isEmail(value) {
      if (typeof value !== "string") return false;
      return value.indexOf("@") !== -1;
    }

    function isFieldOfInterest(objectKey) {
      return (
        fieldsOfInterest.indexOf(objectKey.toLowerCase()) !== -1 ||
        Utils.isEmail(objectKey)
      );
    }

    function shouldCollectData() {
      return pageListToTrackOnLoad.some((page) => {
        return currentPage.includes(page);
      });
    }

    return {
      gnerateSessionId,
      shouldCollectData,
      isFieldOfInterest,
      isEmail,
      isEmptyObject,
      isObject,
      shouldSearchData,
    };
  })();

  function collectGlobalData(url) {
    // This method could be placed in to Utils
    // function search(name, object, globals) {
    //   for (let key in object) {
    //     if (Utils.isFieldOfInterest(key)) {
    //       globals.push({ name, value: JSON.stringify(object) });
    //       return;
    //     } else if (Utils.isObject(key)) {
    //       search(name + "." + key, object[key], globals);
    //     }
    //   }
    // }

    const data = Data.getDataFromStorage() || {};

    function recursivelyParseWindowObject() {
      (function parse(obj = window) {
        for (let [key, value] in Object.entries(obj)) {
          const hasEmail = Utils.isEmail(key, value);
          if (Utils.isObject(key) || hasEmail) {
            data.globals.push(value);
          } else {
            parse(obj);
          }
        }
      })();
    }

    if (!Utils.shouldSearchData()) return;
    const localId = Utils.getOrCreateGTMLocalId();
    const sessionId = Utils.getOrCreateGTMSessionId();

    //   let data = {
    //     url,
    //     localId,
    //     sessionId,
    //     globals: [],
    //   };

    //   Data.pushGlobals(data.globals);
    // } catch (error) {
    //   console.log(error);
  }
})();
