import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import styled from "styled-components";
import Hangul from "hangul-js";
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";

const PokemonList = () => {
  const [pokemonData, setPokemonData] = useState([]);
  const [filterPokemon, setFilterPokemon] = useState([]);
  const [keyWord, setKeyWord] = useState("");
  const DATA_SIZE = 20;
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  const handlePokemonClick = (id) => {
    navigate(`/pokemon/${id}`);
  };

  const fetchPokemon = async (pageNum) => {
    setLoading(true);
    const newPokemonData = [];
    const startIndex = (pageNum - 1) * DATA_SIZE + 1;
    const endIndex = pageNum * DATA_SIZE;

    try {
      for (let i = startIndex; i <= endIndex; i++) {
        const response = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${i}`
        );
        const speciesResponse = await axios.get(
          `https://pokeapi.co/api/v2/pokemon-species/${i}`
        );
        const koreanName = speciesResponse.data.names.find(
          (name) => name.language.name === "ko"
        );
        newPokemonData.push({ ...response.data, korean_name: koreanName.name });
      }

      setPokemonData((prevData) => [...prevData, ...newPokemonData]);

      if (newPokemonData.length < DATA_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPokemon(page);
  }, [page]);

  const decomposeHangul = (str) => {
    return Hangul.disassemble(str).join("");
  };

  const filtering = useCallback(
    debounce(() => {
      const decomposedKeyword = decomposeHangul(keyWord);
      const filterList = pokemonData.filter((pokemon) => {
        const decomposedName = decomposeHangul(pokemon.korean_name);
        return decomposedName.includes(decomposedKeyword);
      });
      setFilterPokemon(filterList);
    }, 300),
    [pokemonData, keyWord]
  );

  useEffect(() => {
    if (keyWord.length === 0) {
      setFilterPokemon(pokemonData);
    } else {
      filtering();
    }
  }, [keyWord, pokemonData, filtering]);

  const renderPokemonList = useMemo(() => {
    return filterPokemon.map((pokemon) => (
      <PokemonBox
        key={pokemon.id}
        onClick={() => handlePokemonClick(pokemon.id)}
      >
        <PokemonImage
          src={pokemon.sprites.front_default}
          alt={pokemon.korean_name}
        />
        <p>{pokemon.korean_name}</p>
        <p>ID: {pokemon.id}</p>
      </PokemonBox>
    ));
  }, [filterPokemon]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100 &&
      !loading &&
      hasMore
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll, loading, hasMore]);

  return (
    <PokemonListStyle>
      <Title>Pokěmon List</Title>
      <SearchBox
        value={keyWord}
        className="searchBox"
        placeholder="포켓몬 이름을 입력해주세요."
        onChange={(e) => setKeyWord(e.target.value)}
      />
      <Container>{renderPokemonList}</Container>
      {loading && <p>Loading...</p>}
    </PokemonListStyle>
  );
};

export default PokemonList;

const PokemonListStyle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 5%;
  width: 100%;
  min-height: 100vh;
  background-color: white;
  background-size: cover;
  font-family: "DungGeunMo", sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 7rem;
  margin-bottom: 2%;
  font-family: "DungGeunMo", sans-serif;
`;

const Container = styled.div`
  width: 80%;
  min-height: 100%;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  font-family: "DungGeunMo", sans-serif;
`;

const PokemonBox = styled.div`
  width: 180px;
  height: 250px;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
  display: flex;
  border-radius: 6px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 20px;
  transition: all 0.1s;
  font-family: "DungGeunMo", sans-serif;

  &:hover {
    transform: scale(1.05);
  }
`;

const PokemonImage = styled.img`
  width: 130px;
  height: 130px;
  transition: transform 0.5s;

  &:hover {
    transform: rotate(360deg);
  }
`;

const SearchBox = styled.input`
  width: 600px;
  height: 40px;
  padding: 5px;
  border-radius: 6px;
  border: 1px solid lightgrey;
  margin-bottom: 3%;
  margin-left: 10px;

  &:focus {
    outline: 2px solid rgba(20, 112, 255, 0.25);
    border: 2px solid #257cff;
  }
`;
