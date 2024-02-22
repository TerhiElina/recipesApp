import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, FlatList, Image } from 'react-native';

export default function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  const fetchRecipes = () => {
    const ingredientList = ingredients.split(',').map((ingredient) => ingredient.trim());

    const fetchPromises = ingredientList.map((ingredient) => {
      return fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`)
        .then((response) => {
          if (!response.ok) throw new Error("Error in fetch" + response.statusText);
          return response.json();
        })
        .then((data) => {
          if (data.meals !== null){
            return data.meals;
          } else {
            return [];
          }
    })
      .catch((err) =>{
        console.error(err);
        return [];
      });
    });
    Promise.all(fetchPromises)
      .then((results) => {
        const allRecipes = results.flat();
        setRecipes(allRecipes);

        //Tarkistetaan, jos ei ole yhtään reseptejä
        if(allRecipes.length === 0){
          setFetchError(true);
        } else {
          setFetchError(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setFetchError(true);
      });
  };
  return (
    <View style={styles.container}>
      <View style={{ flex: 1, marginTop: 60, marginBottom: 50 }}>
        <TextInput
          style={{ marginBottom: 20 }}
          placeholder='Type ingredients separated by commas..'
          value={ingredients}
          onChangeText={(text) => setIngredients(text)}
        />
        <Button title='Fetch Recipes' onPress={fetchRecipes} />
      </View>
      <View style={{ flex: 7 }}>
      {fetchError && (
          <Text style={{ fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 10 }}>
            No recipes found for the given ingredients.
          </Text>
        )}
        <FlatList
          data={recipes}
          keyExtractor={(item, index) => item.idMeal + index}
          renderItem={({ item }) => (
            <View style={{ margin: 10 }}>
              <Text style={{ fontSize: 18 }}>{item.strMeal}</Text>
              <Image
                style={{ height: 200, width: 200 }}
                source={{
                  uri: item.strMealThumb,
                }}
              />
            </View>
          )}
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});