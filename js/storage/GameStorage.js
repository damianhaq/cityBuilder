export class GameStorage {
  static saveGame(gameState, saveName = "autosave") {
    try {
      localStorage.setItem(
        `cityBuilder_${saveName}`,
        JSON.stringify({
          ...gameState,
          timestamp: new Date().toISOString(),
        })
      );
      console.log(`Gra została zapisana jako: ${saveName}`);
      return true;
    } catch (error) {
      console.error("Błąd podczas zapisywania gry:", error);
      return false;
    }
  }

  static loadGame(saveName = "autosave") {
    try {
      const savedState = localStorage.getItem(`cityBuilder_${saveName}`);
      if (!savedState) {
        console.log(`Nie znaleziono zapisu o nazwie: ${saveName}`);
        return null;
      }

      const gameState = JSON.parse(savedState);
      console.log(`Gra została wczytana z zapisu: ${saveName}`);
      console.log(`gameState:`, gameState);
      console.log(
        `Data zapisu: ${new Date(gameState.timestamp).toLocaleString()}`
      );
      return gameState;
    } catch (error) {
      console.error("Błąd podczas wczytywania gry:", error);
      return null;
    }
  }

  static getSavesList() {
    const saves = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("cityBuilder_")) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          saves.push({
            name: key.replace("cityBuilder_", ""),
            timestamp: saveData.timestamp,
          });
        } catch (error) {
          console.error(`Błąd podczas odczytywania zapisu ${key}:`, error);
        }
      }
    }
    return saves;
  }

  static deleteSave(saveName) {
    try {
      localStorage.removeItem(`cityBuilder_${saveName}`);
      console.log(`Zapis ${saveName} został usunięty`);
      return true;
    } catch (error) {
      console.error("Błąd podczas usuwania zapisu:", error);
      return false;
    }
  }

  static getLastSave() {
    const saves = this.getSavesList();
    if (saves.length === 0) return null;

    saves.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return this.loadGame(saves[0].name);
  }
}
